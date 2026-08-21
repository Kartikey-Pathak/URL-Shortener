import jwt from "jsonwebtoken";
import { userTokenSchema } from "../validations/token.validation.js";

const JWT_SECRET=process.env.JWT_SECRET;

export async function createUserToken(payload){

    const validation =await userTokenSchema.safeParseAsync(payload);
    if(validation.error){
        throw new Error(validation.error.message);
    }

    const payloadValidated=validation.data;

    const token=jwt.sign(payloadValidated,JWT_SECRET);
    return token;
}

export function ValidateUserToken(token){
   try {
     const payload=jwt.verify(token,JWT_SECRET);
     return payload
     
   } catch (error) {
    //if something fails
    console.log(error.message);
    return null;
   }
}