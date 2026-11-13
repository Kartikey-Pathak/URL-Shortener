import { string, z } from "zod";

export const signupPostRequestSchema = z.object({
    name: string().optional(),
    username: string().optional(),
    lastname: string().optional(),
    email: string().email(),
    password: string().min(3),
}).refine(data => data.name || data.username, {
    message: "Name or username is required",
    path: ["name"],
});

export const verifyOtpSchema = z.object({
    email: string().email(),
    otp: string().min(4).max(6),
});

export const resendOtpSchema = z.object({
    email: string().email(),
});

export const googleAuthSchema = z.object({
    email: string().email(),
    name: string().optional(),
});

export const loginPostRequestSchema = z.object({
    email: string().email(),
    password: string().min(3),
});

export const ShortenPostRequestSchema = z.object({
    url: z.string().url(),
    code: z.string().optional(),
});
