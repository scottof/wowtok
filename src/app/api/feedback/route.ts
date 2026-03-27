import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  assertSameOrigin,
  consumeRateLimit,
  getRequestIp,
} from "@/lib/security/request";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const rateLimit = consumeRateLimit(`feedback:${getRequestIp(request)}`, {
    limit: 20,
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

  const { type, rating, reasons, message, videoId } = await request.json();

  if (!type) {
    return NextResponse.json(
      { error: "Feedback type is required" },
      { status: 400 }
    );
  }

  // Get user plan info
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { subscription: true },
  });

  const plan = dbUser?.subscription?.plan || "No subscription";

  // Build email content
  const lines: string[] = [
    `User: ${user.email}`,
    `Plan: ${plan}`,
    `Feedback type: ${type}`,
  ];

  if (rating !== undefined) lines.push(`Rating: ${rating}/5`);
  if (videoId) lines.push(`Video ID: ${videoId}`);
  if (reasons && reasons.length > 0)
    lines.push(`Reasons: ${reasons.join(", ")}`);
  if (message) lines.push(`\nMessage:\n${message}`);

  const emailSubject = `[Feedback - ${type}] ${user.email} — ${plan}`;
  const emailBody = lines.join("\n");

  try {
    if (process.env.RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `WowTok Feedback <noreply@wowtok.com>`,
          to: "hello@wowtok.com",
          reply_to: user.email,
          subject: emailSubject,
          text: emailBody,
        }),
      });
    } else {
      console.log("Feedback:", { emailSubject, emailBody });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send feedback" },
      { status: 500 }
    );
  }
}
