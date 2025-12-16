import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  token: string
) {
  const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: "Instaloan <onboarding@resend.dev>",
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Verify your email</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link expires in 15 minutes.</p>
    `,
  });
}
