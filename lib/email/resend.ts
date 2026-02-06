import { Resend } from "resend";
import type { EmailTemplate } from "@/lib/email/templates";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Forbidden 2026 <no-reply@forbidden.example>";

export async function sendEmail(to: string, template: EmailTemplate) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { skipped: true };
  }

  const resend = new Resend(apiKey);
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}
