import {string, z} from "zod";

export const signupPostRequestSchema=z.object({
    name:string(),
    lastname:string().optional(),
    email:string().email(),
    password:string().min(3),
})

export const loginPostRequestSchema=z.object({
    email:string().email(),
    password:string().min(3),
})

export const ShortenPostRequestSchema=z.object({
    url:z.string().url(),
    code:z.string().optional(),
})