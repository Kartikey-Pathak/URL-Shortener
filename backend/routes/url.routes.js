import express from "express";
import { ShortenPostRequestSchema } from "../validations/request.validation.js";
import db from "../db/index.js";
import { usersTable, urlsTable } from "../models/index.js";
import { nanoid } from "nanoid";
import { ensureAuthenticated } from "../middlewares/auth.middlewares.js";
import { createUrl } from "../services/url.service.js";
import { and, eq } from 'drizzle-orm';


const router = express.Router();


router.post("/shorten", ensureAuthenticated, async (req, resp) => {
    const validate = await ShortenPostRequestSchema.safeParseAsync(req.body);
    console.log(req.body);
    if (validate.error) {
        resp.status(400).json({ error: validate.error.message });
    }

    const { url, code } = validate.data;
    const shortCode = code ?? nanoid(6);

    const result = await createUrl(shortCode, url, req.user.id);



    resp.status(201).json({ id: result.id, shortCode: result.shortCode, targetURL: result.targetURL });

})

router.get("/codes",ensureAuthenticated,async (req,resp)=>{
    const codes=await db.select().from(urlsTable).where(eq(urlsTable.userId,req.user.id));

    return resp.json({codes});
})

router.get("/:shortcode", async function (req, resp) {
    const code = req.params.shortcode;
    const [result] = await db.select({
        targetURL: urlsTable.targetURL
    }).from(urlsTable).where(eq(urlsTable.shortCode, code));

    if (!result) {
        resp.status(404).json({ error: "Invalid URL" });
    }

    return resp.redirect(result.targetURL);
})

router.delete("/:id",ensureAuthenticated,async(req,resp)=>{
    const id=req.params.id;
    await db.delete(urlsTable).where(and(eq(urlsTable.id,id),eq(req.user.id,urlsTable.userId)));

    return resp.status(201).json({delete:true});
})





export default router;