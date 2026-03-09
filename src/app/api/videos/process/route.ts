import { NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateScenes } from "@/lib/ai/openai";
import {
  generateImage,
  generateVideoFromImage,
  mergeVideos,
  mergeAudioVideo,
  uploadAudioToFal,
} from "@/lib/ai/fal";
import { generateVoiceoverWithTimestamps } from "@/lib/ai/elevenlabs";
import { getTheme } from "@/config/themes";
import { env } from "@/lib/env";
import type { Scene } from "@/types";

export const maxDuration = 300;

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

function triggerNextStep(videoId: string, step: string) {
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
          body: JSON.stringify({ videoId, step }),
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
 * Retry a single async operation with exponential backoff.
 * Used for individual image/video generations that may transiently fail.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  retries = 2
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt === retries) throw e;
      const delay = 2000 * (attempt + 1); // 2s, 4s
      console.warn(`${label} attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error(`${label} failed after ${retries + 1} attempts`);
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

  const { videoId, step } = await req.json();

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
        triggerNextStep(videoId, "images");
        break;
      }

      case "images": {
        await updateVideoStatus(videoId, "IMAGES");
        const scenes = await getFreshScenes(videoId);

        const themeConfig = getTheme(video.theme);
        const style = themeConfig?.style || "cinematic, high quality";

        // Generate ALL images in parallel with per-image retry
        const imageResults = await Promise.allSettled(
          scenes.map((scene, i) =>
            withRetry(
              () => generateImage(scene.visualDescription, style),
              `Image scene ${i}`
            )
          )
        );

        for (let i = 0; i < scenes.length; i++) {
          const result = imageResults[i];
          if (result.status === "fulfilled") {
            scenes[i] = { ...scenes[i], imageUrl: result.value };
          } else {
            throw new Error(
              `Image generation failed for scene ${i}: ${result.reason}`
            );
          }
        }

        await updateVideoStatus(videoId, "IMAGES", {
          scenes: JSON.parse(JSON.stringify(scenes)),
        });
        triggerNextStep(videoId, "videos");
        break;
      }

      case "videos": {
        await updateVideoStatus(videoId, "VIDEO");
        const scenes = await getFreshScenes(videoId);

        // Generate ALL video clips in parallel with per-clip retry
        const videoResults = await Promise.allSettled(
          scenes
            .filter((scene) => !!scene.imageUrl)
            .map((scene, i) =>
              withRetry(
                () =>
                  generateVideoFromImage(
                    scene.imageUrl!,
                    scene.visualDescription
                  ),
                `Video scene ${i}`
              )
            )
        );

        const scenesWithImages = scenes.filter((s) => !!s.imageUrl);
        for (let i = 0; i < scenesWithImages.length; i++) {
          const result = videoResults[i];
          const sceneIdx = scenes.findIndex(
            (s) => s.index === scenesWithImages[i].index
          );
          if (result.status === "fulfilled") {
            scenes[sceneIdx] = { ...scenes[sceneIdx], videoUrl: result.value };
          } else {
            throw new Error(
              `Video generation failed for scene ${sceneIdx}: ${result.reason}`
            );
          }
        }

        await updateVideoStatus(videoId, "VIDEO", {
          scenes: JSON.parse(JSON.stringify(scenes)),
        });
        triggerNextStep(videoId, "voiceover");
        break;
      }

      case "voiceover": {
        await updateVideoStatus(videoId, "VOICEOVER");
        const { audioBuffer, srt } = await generateVoiceoverWithTimestamps(
          video.narratorText,
          video.voiceId || "adam"
        );

        // Upload audio to FAL.ai storage (publicly accessible, FAL APIs can consume directly)
        const voiceoverFileUrl = await uploadAudioToFal(audioBuffer);

        await prisma.video.update({
          where: { id: videoId },
          data: { voiceoverUrl: voiceoverFileUrl, subtitles: srt },
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
