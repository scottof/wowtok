import { NextResponse } from "next/server";
import {
  assertSameOrigin,
  consumeRateLimit,
  getRequestIp,
} from "@/lib/security/request";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const { name, email, subject, message, company } = await request.json();

  if (company) {
    return NextResponse.json({ success: true });
  }

  const rateLimit = consumeRateLimit(`contact:${getRequestIp(request)}`, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "Name, email, subject, and message are required" },
      { status: 400 }
    );
  }

  const emailSubject = `[Contact] ${subject}`;
  const emailBody = `From: ${name} <${email}>\n\n${message}`;

  try {
    if (process.env.RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "WowTok Contact <noreply@wowtok.com>",
          to: "hello@wowtok.com",
          reply_to: email,
          subject: emailSubject,
          text: emailBody,
        }),
      });
    } else {
      console.log("Public contact request:", { emailSubject, emailBody });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
