import nodemailer from "nodemailer";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMagicLink(
  email: string,
  magicLink: string
): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || "noreply@univote.com",
      to: email,
      subject: "Your UniVote Login Link",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { color: #2563EB; font-size: 24px; font-weight: bold; }
            .button { display: inline-block; background: #2563EB; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🗳️ UniVote</div>
              <h2>Secure Login Link</h2>
            </div>
            
            <p>Hello,</p>
            <p>You requested to sign in to UniVote. Click the button below to access your account:</p>
            
            <div style="text-align: center;">
              <a href="${magicLink}" class="button">Sign In to UniVote</a>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This link expires in 15 minutes</li>
              <li>It can only be used once</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
            
            <div class="footer">
              <p>UniVote - Secure University Elections<br>
              This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email");
  }
}
