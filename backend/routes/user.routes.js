import express from "express";
import { randomBytes } from "node:crypto";
import db from '../db/index.js';
import { usersTable, urlsTable } from "../models/index.js";
import { eq } from "drizzle-orm";
import {
    signupPostRequestSchema,
    loginPostRequestSchema,
    verifyOtpSchema,
    resendOtpSchema,
    googleAuthSchema
} from "../validations/request.validation.js";
import { hashPasswordWithSalt } from "../utils/hash.js";
import { getUserByEmail, createUser } from "../services/user.service.js";
import { createUserToken } from "../utils/token.js";
import { sendOtpEmail } from "../utils/mailer.js";
import { ensureAuthenticated } from "../middlewares/auth.middlewares.js";

const router = express.Router();

// In-memory store for pending OTP signups: email -> { name, email, password, salt, otp, expiresAt }
const otpStore = new Map();

// 1. Initiate Signup: validate data, generate OTP, send via nodemailer
router.post("/signup", async (req, resp) => {
    const validation = await signupPostRequestSchema.safeParseAsync(req.body);
    if (validation.error) {
        return resp.status(400).json({ error: validation.error.format() });
    }

    const { email, password } = validation.data;
    const name = validation.data.name || validation.data.username;

    // Check if user already exists
    const exist = await getUserByEmail(email);
    if (exist) {
        return resp.status(400).json({ error: "Email already registered. Please login instead." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the password with salt beforehand
    const { salt, password: hashpassword } = hashPasswordWithSalt(password);

    // Save temporary signup data with 10-minute validity
    otpStore.set(email, {
        name,
        email,
        password: hashpassword,
        salt,
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    try {
        await sendOtpEmail(email, otp);
        return resp.status(200).json({
            message: "OTP sent successfully. Please check your email.",
            email
        });
    } catch (mailError) {
        console.error("Failed to send OTP email:", mailError?.message || mailError);
        // On free hosting platforms like Render where outbound SMTP ports are blocked,
        // provide the OTP directly so signup is never blocked with 502/500 errors!
        return resp.status(200).json({
            message: "OTP generated successfully.",
            email,
            devOtp: otp
        });
    }
});

// 2. Verify OTP: check OTP, then save user to DB
router.post("/verify-otp", async (req, resp) => {
    const validation = await verifyOtpSchema.safeParseAsync(req.body);
    if (validation.error) {
        return resp.status(400).json({ error: "Invalid input. Please provide email and 6-digit OTP." });
    }

    const { email, otp } = validation.data;
    const pendingUser = otpStore.get(email);

    if (!pendingUser) {
        return resp.status(400).json({ error: "No pending signup found or OTP expired. Please sign up again." });
    }

    if (pendingUser.expiresAt < Date.now()) {
        otpStore.delete(email);
        return resp.status(400).json({ error: "OTP has expired. Please sign up again or request a new OTP." });
    }

    if (pendingUser.otp !== otp.trim()) {
        return resp.status(400).json({ error: "Invalid OTP. Please check your email and try again." });
    }

    // OTP verified! Now save user into the database
    const user = await createUser(pendingUser.name, pendingUser.email, pendingUser.password, pendingUser.salt);

    // Clean up OTP store
    otpStore.delete(email);

    // Generate JWT token
    const token = await createUserToken({ id: user.id });

    return resp.status(201).json({
        message: "Account verified and registered successfully!",
        token,
        user: {
            id: user.id,
            name: pendingUser.name,
            email: pendingUser.email
        }
    });
});

// 3. Resend OTP
router.post("/resend-otp", async (req, resp) => {
    const validation = await resendOtpSchema.safeParseAsync(req.body);
    if (validation.error) {
        return resp.status(400).json({ error: "Please provide a valid email." });
    }

    const { email } = validation.data;
    const pendingUser = otpStore.get(email);

    if (!pendingUser) {
        return resp.status(400).json({ error: "No pending signup found. Please sign up again." });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    pendingUser.otp = newOtp;
    pendingUser.expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(email, pendingUser);

    try {
        await sendOtpEmail(email, newOtp);
        return resp.status(200).json({ message: "A new OTP has been sent to your email." });
    } catch (mailError) {
        console.error("Failed to resend OTP email:", mailError?.message || mailError);
        return resp.status(200).json({
            message: "A new OTP has been generated.",
            devOtp: newOtp
        });
    }
});

// 4. Standard Login Route
router.post("/login", async (req, resp) => {
    const validationResult = await loginPostRequestSchema.safeParseAsync(req.body);
    if (validationResult.error) {
        return resp.status(400).json({ error: validationResult.error.format() });
    }

    const { email, password } = validationResult.data;

    const user = await getUserByEmail(email);
    if (!user) {
        return resp.status(404).json({ error: "Email does not exist." });
    }

    const { password: hashpassword } = hashPasswordWithSalt(password, user.salt);

    // Check if password matches
    if (user.password !== hashpassword) {
        return resp.status(400).json({ error: "Invalid password." });
    }

    // Password correct, create JWT token
    const token = await createUserToken({ id: user.id });

    return resp.status(200).json({
        message: "Login successful",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

// 5. Google OAuth Login / Signup Handler
router.post("/google-auth", async (req, resp) => {
    const validation = await googleAuthSchema.safeParseAsync(req.body);
    if (validation.error) {
        return resp.status(400).json({ error: "Invalid Google user data." });
    }

    const { email, name } = validation.data;

    let user = await getUserByEmail(email);

    if (!user) {
        // Automatically create user in DB for new Google accounts
        const randomPass = randomBytes(16).toString("hex");
        const { salt, password: hashpassword } = hashPasswordWithSalt(randomPass);
        const newUser = await createUser(name || email.split("@")[0], email, hashpassword, salt);
        user = {
            id: newUser.id,
            name: name || email.split("@")[0],
            email
        };
    }

    const token = await createUserToken({ id: user.id });

    return resp.status(200).json({
        message: "Google login successful",
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

// 6. Get Current User Info
router.get("/me", ensureAuthenticated, async (req, resp) => {
    const [user] = await db.select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, req.user.id));

    if (!user) {
        return resp.status(404).json({ error: "User not found." });
    }

    return resp.status(200).json({ user });
});

// 7. Delete User Account
router.delete("/delete", ensureAuthenticated, async (req, resp) => {
    try {
        await db.delete(urlsTable).where(eq(urlsTable.userId, req.user.id));
        await db.delete(usersTable).where(eq(usersTable.id, req.user.id));

        return resp.status(200).json({ message: "Account deleted successfully", delete: true });
    } catch (error) {
        console.error("Failed to delete user account:", error);
        return resp.status(500).json({ error: "Failed to delete account" });
    }
});

export default router;
