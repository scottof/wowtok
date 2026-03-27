import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  assertSameOrigin,
  consumeRateLimit,
  getRequestIp,
} from "@/lib/security/request";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const rateLimit = consumeRateLimit(`support:${getRequestIp(request)}`, {
    limit: 10,
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, message, supportLevel } = await request.json();

  if (!subject || !message) {
    return NextResponse.json(
      { error: "Subject and message are required" },
      { status: 400 }
    );
  }

  // Send email via Resend or fallback to a simple fetch to a webhook/email API
  // For now, we use a simple mailto-style approach via a serverless email API
  const emailSubject = `[${supportLevel} Support] ${subject}`;
  const emailBody = `From: ${user.email}\nPlan: ${supportLevel}\n\n${message}`;

  try {
    // If RESEND_API_KEY is configured, use Resend
    if (process.env.RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `WowTok Support <noreply@wowtok.com>`,
          to: "hello@wowtok.com",
          reply_to: user.email,
          subject: emailSubject,
          text: emailBody,
        }),
      });
    } else {
      // Fallback: log to console in development
      console.log("Support request:", { emailSubject, emailBody });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
