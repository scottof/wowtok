import { NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateScenes } from "@/lib/ai/openai";
import {
  generateImage,
  generateVideoFromImage,
  mergeVideos,
  mergeAudioVideo,
} from "@/lib/ai/fal";
import { generateVoiceover } from "@/lib/ai/elevenlabs";
import { getTheme } from "@/config/themes";
import { env } from "@/lib/env";
import type { Scene } from "@/types";

export const maxDuration = 60;

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function triggerNextStep(
  videoId: string,
  step: string,
  sceneIndex?: number
) {
  const baseUrl = getBaseUrl();
  after(async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * attempt));
        }
        const res = await fetch(`${baseUrl}/api/videos/process`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-process-secret": env.PROCESS_SECRET,
          },
          body: JSON.stringify({ videoId, step, sceneIndex }),
        });
        if (res.ok) return; // Success
        lastError = new Error(`HTTP ${res.status}`);
      } catch (e) {
        lastError = e;
      }
    }
    // All retries exhausted — mark the video as FAILED so it doesn't stay stuck
    console.error(
      `Pipeline chain broken: failed to trigger step "${step}" for video ${videoId} after ${MAX_RETRIES + 1} attempts:`,
      lastError
    );
    try {
      await prisma.video.update({
        where: { id: videoId },
        data: {
          status: "FAILED" as never,
          errorMessage: `Pipeline stalled: could not trigger step "${step}". Please retry.`,
        },
      });
    } catch (dbErr) {
      console.error("Failed to mark video as FAILED:", dbErr);
    }
  });
}

async function updateVideoStatus(
  videoId: string,
  status: string,
  data?: Record<string, unknown>
) {
  await prisma.video.update({
    where: { id: videoId },
    data: { status: status as never, ...data },
  });
}

/**
 * Fetch fresh scene data from the database.
 * Avoids stale reads when scenes are updated across chained requests.
 */
async function getFreshScenes(videoId: string): Promise<Scene[]> {
  const video = await prisma.video.findUniqueOrThrow({
    where: { id: videoId },
  });
  return (video.scenes as unknown as Scene[]) || [];
}

export async function POST(req: Request) {
  // Verify internal secret
  const secret = req.headers.get("x-process-secret");
  if (secret !== env.PROCESS_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoId, step, sceneIndex } = await req.json();

  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video || video.status === "COMPLETED" || video.status === "FAILED") {
    return NextResponse.json({ error: "Invalid video state" }, { status: 400 });
  }

  try {
    switch (step) {
      case "scenes": {
        await updateVideoStatus(videoId, "SCENES");
        const scenes = await generateScenes(
          video.theme,
          video.prompt,
          video.narratorText
        );
        await updateVideoStatus(videoId, "SCENES", {
          scenes: JSON.parse(JSON.stringify(scenes)),
        });
        // Start generating images one by one
        triggerNextStep(videoId, "image", 0);
        break;
      }

      case "image": {
        const idx = sceneIndex ?? 0;

        if (idx === 0) {
          await updateVideoStatus(videoId, "IMAGES");
        }

        // Always read fresh scenes to avoid stale data from previous steps
        const scenes = await getFreshScenes(videoId);

        const scene = scenes[idx];
        if (!scene) {
          // All images done, start video generation
          triggerNextStep(videoId, "video", 0);
          break;
        }

        const themeConfig = getTheme(video.theme);
        const style = themeConfig?.style || "cinematic, high quality";
        const imageUrl = await generateImage(scene.visualDescription, style);

        // Update this scene's imageUrl
        scenes[idx] = { ...scene, imageUrl };
        await updateVideoStatus(videoId, "IMAGES", {
          scenes: JSON.parse(JSON.stringify(scenes)),
        });

        if (idx + 1 < scenes.length) {
          // More images to generate
          triggerNextStep(videoId, "image", idx + 1);
        } else {
          // All images done, start video clips
          triggerNextStep(videoId, "video", 0);
        }
        break;
      }

      case "video": {
        const idx = sceneIndex ?? 0;

        if (idx === 0) {
          await updateVideoStatus(videoId, "VIDEO");
        }

        // Always read fresh scenes to get imageUrls from the image step
        const scenes = await getFreshScenes(videoId);

        const scene = scenes[idx];
        if (!scene || !scene.imageUrl) {
          // All videos done, start voiceover
          triggerNextStep(videoId, "voiceover");
          break;
        }

        const videoUrl = await generateVideoFromImage(
          scene.imageUrl,
          scene.visualDescription
        );

        scenes[idx] = { ...scene, videoUrl };
        await updateVideoStatus(videoId, "VIDEO", {
          scenes: JSON.parse(JSON.stringify(scenes)),
        });

        if (idx + 1 < scenes.length) {
          triggerNextStep(videoId, "video", idx + 1);
        } else {
          triggerNextStep(videoId, "voiceover");
        }
        break;
      }

      case "voiceover": {
        await updateVideoStatus(videoId, "VOICEOVER");
        const audioBuffer = await generateVoiceover(
          video.narratorText,
          video.voiceId || "adam"
        );

        // Upload audio to Supabase Storage
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          env.NEXT_PUBLIC_SUPABASE_URL,
          env.SUPABASE_SERVICE_ROLE_KEY
        );

        const audioPath = `videos/${videoId}/voiceover.mp3`;
        await supabase.storage
          .from("media")
          .upload(audioPath, audioBuffer, {
            contentType: "audio/mpeg",
            upsert: true,
          });

        // Save the public URL so we can use it in compose and let users download
        const { data: audioUrlData } = supabase.storage
          .from("media")
          .getPublicUrl(audioPath);
        await prisma.video.update({
          where: { id: videoId },
          data: { voiceoverUrl: audioUrlData.publicUrl },
        });

        triggerNextStep(videoId, "compose");
        break;
      }

      case "compose": {
        await updateVideoStatus(videoId, "COMPOSING");

        // Get fresh scenes and video record
        const scenes = await getFreshScenes(videoId);
        const latestVideo = await prisma.video.findUniqueOrThrow({
          where: { id: videoId },
        });

        // Collect all scene video URLs (in order)
        const clipUrls = scenes
          .sort((a, b) => a.index - b.index)
          .map((s) => s.videoUrl)
          .filter((url): url is string => !!url);

        if (clipUrls.length === 0) {
          throw new Error("No video clips to compose");
        }

        // Step 1: Concatenate all scene clips into one video (FREE via FFmpeg API)
        let finalVideoUrl: string;
        if (clipUrls.length === 1) {
          finalVideoUrl = clipUrls[0];
        } else {
          finalVideoUrl = await mergeVideos(clipUrls);
        }

        // Step 2: Merge voiceover audio with the concatenated video (FREE via FFmpeg API)
        const voiceoverUrl = latestVideo.voiceoverUrl;
        if (voiceoverUrl) {
          finalVideoUrl = await mergeAudioVideo(finalVideoUrl, voiceoverUrl);
        }

        const thumbnailUrl = scenes[0]?.imageUrl || null;
        const actualDuration = clipUrls.length * 5; // Each Kling clip is 5 seconds

        await updateVideoStatus(videoId, "COMPLETED", {
          videoUrl: finalVideoUrl,
          thumbnailUrl,
          duration: actualDuration,
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown step: ${step}` },
          { status: 400 }
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Pipeline step "${step}" failed for video ${videoId}:`, message);
    await updateVideoStatus(videoId, "FAILED", {
      errorMessage: message,
    });
  }

  return NextResponse.json({ ok: true });
}
