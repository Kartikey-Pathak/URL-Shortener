import express from "express";
import { ShortenPostRequestSchema } from "../validations/request.validation.js";
import db from "../db/index.js";
import { usersTable,urlsTable } from "../models/index.js";
import { nanoid } from "nanoid";
import { ensureAuthenticated } from "../middlewares/auth.middlewares.js";
import { createUrl } from "../services/url.service.js";

const router=express.Router();


router.post("/shorten",ensureAuthenticated,async(req,resp)=>{
    const validate=await ShortenPostRequestSchema.safeParseAsync(req.body);
    console.log(req.body);
    if(validate.error){
        resp.status(400).json({error:validate.error.message});
    }

    const {url,code}=validate.data;
    const shortCode=code??nanoid(6);

    const result=await createUrl(shortCode,url,req.user.id);

    

    resp.status(201).json({id:result.id,shortCode:result.shortCode,targetURL:result.targetURL});

})


router.get("/:shortcode",async function(req,resp){
    const code=req.params.shortcode;
    
})




export default router;