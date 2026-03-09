import { NextResponse, after } from "next/server";
import { Prisma } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id: videoId } = await params;

    const video = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video || video.userId !== dbUser.id) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (video.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Completed videos cannot be retried" },
        { status: 400 }
      );
    }

    // Allow retry for FAILED videos and stuck processing videos (>10 min since last update)
    const STUCK_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
    const isStuck =
      video.status !== "FAILED" &&
      Date.now() - new Date(video.updatedAt).getTime() > STUCK_THRESHOLD_MS;

    if (video.status !== "FAILED" && !isStuck) {
      return NextResponse.json(
        { error: "Video is still processing" },
        { status: 400 }
      );
    }

    // Reset the video to PENDING — clear previous partial data
    await prisma.video.update({
      where: { id: videoId },
      data: {
        status: "PENDING",
        scenes: Prisma.DbNull,
        videoUrl: null,
        voiceoverUrl: null,
        subtitles: null,
        thumbnailUrl: null,
        duration: null,
        errorMessage: null,
      },
    });

    // Re-trigger the pipeline
    const baseUrl = getBaseUrl();
    after(async () => {
      try {
        await fetch(`${baseUrl}/api/videos/process`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-process-secret": env.PROCESS_SECRET,
          },
          body: JSON.stringify({ videoId, step: "scenes" }),
        });
      } catch (e) {
        console.error("Failed to trigger retry pipeline:", e);
      }
    });

    return NextResponse.json({ videoId });
  } catch (error) {
    console.error("Retry video error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
