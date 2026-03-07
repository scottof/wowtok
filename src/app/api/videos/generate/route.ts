import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getVideosLimit } from "@/lib/stripe/config";
import { env } from "@/lib/env";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { subscription: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check subscription
    if (
      !dbUser.subscription ||
      dbUser.subscription.status !== "ACTIVE"
    ) {
      return NextResponse.json(
        { error: "Active subscription required" },
        { status: 403 }
      );
    }

    // Check usage
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const limit = getVideosLimit(dbUser.subscription.plan);

    const usage = await prisma.usageRecord.upsert({
      where: { userId_month: { userId: dbUser.id, month } },
      update: {},
      create: {
        userId: dbUser.id,
        month,
        videosGenerated: 0,
        videosLimit: limit,
      },
    });

    if (usage.videosGenerated >= usage.videosLimit) {
      return NextResponse.json(
        { error: "Monthly video limit reached" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { title, theme, prompt, narratorText, voiceId } = body;

    if (!title || !theme || !prompt || !narratorText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create video record
    const video = await prisma.video.create({
      data: {
        userId: dbUser.id,
        title,
        theme,
        prompt,
        narratorText,
        voiceId: voiceId || "adam",
        status: "PENDING",
      },
    });

    // Increment usage
    await prisma.usageRecord.update({
      where: { userId_month: { userId: dbUser.id, month } },
      data: { videosGenerated: { increment: 1 } },
    });

    // Trigger background pipeline (self-chaining step processor)
    const baseUrl = getBaseUrl();
    after(async () => {
      try {
        await fetch(`${baseUrl}/api/videos/process`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-process-secret": env.PROCESS_SECRET,
          },
          body: JSON.stringify({ videoId: video.id, step: "scenes" }),
        });
      } catch (e) {
        console.error("Failed to trigger pipeline:", e);
      }
    });

    return NextResponse.json({ videoId: video.id });
  } catch (error) {
    console.error("Generate video error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
