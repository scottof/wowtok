import { fal } from "@fal-ai/client";
import { env } from "@/lib/env";

let configured = false;
function ensureConfig() {
  if (!configured) {
    fal.config({ credentials: env.FAL_KEY });
    configured = true;
  }
}

export async function generateImage(
  visualDescription: string,
  style: string
): Promise<string> {
  ensureConfig();
  try {
    const result = await fal.subscribe("fal-ai/flux-pro/v1.1", {
      input: {
        prompt: `${visualDescription}. Style: ${style}. Vertical composition 9:16 aspect ratio, cinematic quality, highly detailed.`,
        image_size: {
          width: 1080,
          height: 1920,
        },
        num_images: 1,
        enable_safety_checker: true,
      },
    });

    const data = result.data as { images: { url: string }[] };
    if (!data.images?.[0]?.url) {
      throw new Error("No image generated");
    }

    return data.images[0].url;
  } catch (error: unknown) {
    const e = error as { message?: string; body?: unknown; status?: number };
    console.error("[FAL] Image generation error:", {
      message: e.message,
      status: e.status,
      body: JSON.stringify(e.body || {}).substring(0, 500),
    });
    throw error;
  }
}

export async function generateVideoFromImage(
  imageUrl: string,
  prompt: string
): Promise<string> {
  ensureConfig();
  const result = await fal.subscribe("fal-ai/kling-video/v2.6/pro/image-to-video", {
    input: {
      prompt: `${prompt}. Smooth cinematic motion, gentle camera movement, atmospheric.`,
      start_image_url: imageUrl,
      duration: "5",
      generate_audio: false,
    },
    pollInterval: 3000,
  });

  const data = result.data as { video: { url: string } };
  if (!data.video?.url) {
    throw new Error("No video generated");
  }

  return data.video.url;
}

export async function mergeVideos(videoUrls: string[]): Promise<string> {
  ensureConfig();
  const result = await fal.subscribe("fal-ai/ffmpeg-api/merge-videos", {
    input: {
      video_urls: videoUrls,
      resolution: {
        width: 1080,
        height: 1920,
      },
    },
    pollInterval: 3000,
  });

  const data = result.data as { video: { url: string } };
  if (!data.video?.url) {
    throw new Error("Failed to merge videos");
  }

  return data.video.url;
}

/**
 * Upload an audio buffer to FAL.ai storage.
 * Returns a publicly accessible URL that FAL.ai APIs can consume directly.
 */
export async function uploadAudioToFal(audioBuffer: Buffer): Promise<string> {
  ensureConfig();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: "audio/mpeg" });
  const url = await fal.storage.upload(blob);
  return url;
}

export async function mergeAudioVideo(
  videoUrl: string,
  audioUrl: string
): Promise<string> {
  ensureConfig();
  const result = await fal.subscribe("fal-ai/ffmpeg-api/merge-audio-video", {
    input: {
      video_url: videoUrl,
      audio_url: audioUrl,
    },
    pollInterval: 3000,
  });

  const data = result.data as { video: { url: string } };
  if (!data.video?.url) {
    throw new Error("Failed to merge audio and video");
  }

  return data.video.url;
}
