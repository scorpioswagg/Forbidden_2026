import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/resend";
import { welcomeTemplate } from "@/lib/email/templates";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : null;

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  await sendEmail(email, welcomeTemplate({ name: "Tester" }));

  return NextResponse.json({ ok: true });
}
