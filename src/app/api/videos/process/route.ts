import { NextResponse } from "next/server";
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
 * Run the full video pipeline in a single request.
 * All steps execute sequentially — no HTTP self-chaining needed.
 *
 * Flow: scenes → images → videos → voiceover → compose
 */
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

  // Respond immediately so the caller doesn't wait
  // The pipeline runs inline (not via after()) so maxDuration applies
  try {
    // ── Step 1: Scenes ──────────────────────────────────────────────
    let scenes: Scene[];

    if (step === "scenes" || step === "all") {
      await updateVideoStatus(videoId, "SCENES");
      scenes = await generateScenes(
        video.theme,
        video.prompt,
        video.narratorText
      );
      await updateVideoStatus(videoId, "SCENES", {
        scenes: JSON.parse(JSON.stringify(scenes)),
      });
    } else {
      // Resuming from a later step — load existing scenes
      scenes = (video.scenes as unknown as Scene[]) || [];
    }

    // ── Step 2: Images (parallel) ───────────────────────────────────
    if (["scenes", "all", "images"].includes(step)) {
      await updateVideoStatus(videoId, "IMAGES");

      const themeConfig = getTheme(video.theme);
      const style = themeConfig?.style || "cinematic, high quality";

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
    }

    // ── Step 3: Videos (parallel) ───────────────────────────────────
    if (["scenes", "all", "images", "videos"].includes(step)) {
      await updateVideoStatus(videoId, "VIDEO");

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
    }

    // ── Step 4: Voiceover + SRT ─────────────────────────────────────
    let voiceoverUrl: string | null = video.voiceoverUrl;

    if (["scenes", "all", "images", "videos", "voiceover"].includes(step)) {
      await updateVideoStatus(videoId, "VOICEOVER");
      const { audioBuffer, srt } = await generateVoiceoverWithTimestamps(
        video.narratorText,
        video.voiceId || "adam"
      );

      voiceoverUrl = await uploadAudioToFal(audioBuffer);

      await prisma.video.update({
        where: { id: videoId },
        data: { voiceoverUrl, subtitles: srt },
      });
    }

    // ── Step 5: Compose (merge clips + audio) ───────────────────────
    await updateVideoStatus(videoId, "COMPOSING");

    // Re-read scenes in case they were loaded from DB
    if (!["scenes", "all", "images", "videos"].includes(step)) {
      const freshVideo = await prisma.video.findUniqueOrThrow({
        where: { id: videoId },
      });
      scenes = (freshVideo.scenes as unknown as Scene[]) || [];
      voiceoverUrl = freshVideo.voiceoverUrl;
    }

    const clipUrls = scenes
      .sort((a, b) => a.index - b.index)
      .map((s) => s.videoUrl)
      .filter((url): url is string => !!url);

    if (clipUrls.length === 0) {
      throw new Error("No video clips to compose");
    }

    // Concatenate all scene clips into one video (FREE via FFmpeg API)
    let finalVideoUrl: string;
    let actualDuration = clipUrls.length * 5; // fallback estimate

    if (clipUrls.length === 1) {
      finalVideoUrl = clipUrls[0];
    } else {
      const merged = await mergeVideos(clipUrls);
      finalVideoUrl = merged.url;
      if (merged.duration > 0) actualDuration = merged.duration;
    }

    // Merge voiceover audio with the concatenated video (FREE via FFmpeg API)
    if (voiceoverUrl) {
      const withAudio = await mergeAudioVideo(finalVideoUrl, voiceoverUrl);
      finalVideoUrl = withAudio.url;
      if (withAudio.duration > 0) actualDuration = withAudio.duration;
    }

    const thumbnailUrl = scenes[0]?.imageUrl || null;

    await updateVideoStatus(videoId, "COMPLETED", {
      videoUrl: finalVideoUrl,
      thumbnailUrl,
      duration: actualDuration,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Pipeline failed for video ${videoId}:`, message);
    await updateVideoStatus(videoId, "FAILED", {
      errorMessage: message,
    });
  }

  return NextResponse.json({ ok: true });
}
