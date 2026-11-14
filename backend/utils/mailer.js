import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 4000,
    greetingTimeout: 4000,
    socketTimeout: 5000,
});

export async function sendOtpEmail(toEmail, otp) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("EMAIL_USER or EMAIL_PASS not configured");
    }

    const mailOptions = {
        from: `"URL Shortener" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Your OTP Verification Code - URL Shortener",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #334155; border-radius: 12px; background-color: #0f172a; color: #ffffff;">
            <h2 style="color: #c084fc; text-align: center; margin-bottom: 8px;">URL Shortener</h2>
            <p style="font-size: 15px; color: #94a3b8; text-align: center; margin-top: 0;">Email Verification</p>
            <div style="margin: 24px 0; padding: 20px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 8px; text-align: center;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #c084fc;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #cbd5e1; text-align: center;">Enter this 6-digit OTP code to complete your signup.</p>
            <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
        `,
    };

    // Strict 4.5s timeout so it never blocks or causes 502 Bad Gateway on hosts where SMTP is restricted
    return await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("SMTP connection timed out (Render free tier blocks SMTP ports 465/587)")), 4500)
        ),
    ]);
}

