import { NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateScenes } from "@/lib/ai/openai";
import { generateImage, generateVideoFromImage } from "@/lib/ai/fal";
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

function triggerNextStep(
  videoId: string,
  step: string,
  sceneIndex?: number
) {
  const baseUrl = getBaseUrl();
  after(async () => {
    try {
      await fetch(`${baseUrl}/api/videos/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-process-secret": env.PROCESS_SECRET,
        },
        body: JSON.stringify({ videoId, step, sceneIndex }),
      });
    } catch (e) {
      console.error("Failed to trigger next step:", e);
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
        const scenes = (video.scenes as unknown as Scene[]) || [];

        if (idx === 0) {
          await updateVideoStatus(videoId, "IMAGES");
        }

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
        const scenes = (video.scenes as unknown as Scene[]) || [];

        if (idx === 0) {
          await updateVideoStatus(videoId, "VIDEO");
        }

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

        triggerNextStep(videoId, "compose");
        break;
      }

      case "compose": {
        await updateVideoStatus(videoId, "COMPOSING");

        // Re-fetch video to get latest scenes with all URLs
        const latestVideo = await prisma.video.findUniqueOrThrow({
          where: { id: videoId },
        });
        const scenes = (latestVideo.scenes as unknown as Scene[]) || [];

        // MVP: Use first generated video clip as main video
        const finalVideoUrl = scenes[0]?.videoUrl || null;
        const thumbnailUrl = scenes[0]?.imageUrl || null;
        const estimatedDuration = Math.ceil(
          latestVideo.narratorText.length / 15
        );

        await updateVideoStatus(videoId, "COMPLETED", {
          videoUrl: finalVideoUrl,
          thumbnailUrl,
          duration: estimatedDuration,
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
