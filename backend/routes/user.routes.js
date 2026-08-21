import express from "express";
import db from '../db/index.js';
import { usersTable } from "../models/user.model.js";
import { eq } from "drizzle-orm";
import { signupPostRequestSchema,loginPostRequestSchema } from "../validations/request.validation.js";
import { hashPasswordWithSalt } from "../utils/hash.js";
import { getUserByEmail } from "../services/user.service.js";
import { createUser } from "../services/user.service.js";
import { createUserToken } from "../utils/token.js";


const router = express.Router();

router.post("/signup", async (req, resp) => {
    const validation = await signupPostRequestSchema.safeParseAsync(req.body);
    if (validation.error) {
        return resp.status(400).json({ error: validation.error.format() });
    }

    const { name, email, password } = validation.data;


   const exist=await getUserByEmail(email);

    if (exist) {
        return resp.status(400).json({ error: "Email Exists...!" });
    }


   const {salt,password:hashpassword}=hashPasswordWithSalt(password);
    
   const user=await createUser(name,email,hashpassword,salt);

    return resp.status(201).json({ message: "user saved" ,user});
})

//login route...
router.post("/login",async(req,resp)=>{
    const ValidationResult=await loginPostRequestSchema.safeParseAsync(req.body);
    if(ValidationResult.error){
         return resp.status(400).json({ error: validation.error.format() });
    }

    const {email,password}=ValidationResult.data;

    const user=await getUserByEmail(email);
    if(!user){
        return resp.status(404).json({error:"email does not exist..."});
    }

    const {password:hashpassword}=hashPasswordWithSalt(password,user.salt);

    //check if password correct
    if(user.password!==hashpassword){
        return resp.status(400).json({error:"Invalid password..."});
    }

    //now password correct make a token JWT..
    
    const token=await createUserToken({id:user.id}); 

    return resp.json({token});

})


export default router;