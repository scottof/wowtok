import { fal } from "@fal-ai/client";

let configured = false;
function ensureConfig() {
  if (!configured) {
    fal.config({ credentials: process.env.FAL_KEY });
    configured = true;
  }
}

export async function generateImage(
  visualDescription: string,
  style: string
): Promise<string> {
  ensureConfig();
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
}

export async function generateVideoFromImage(
  imageUrl: string,
  prompt: string
): Promise<string> {
  ensureConfig();
  const result = await fal.subscribe("fal-ai/minimax/video-01-live/image-to-video", {
    input: {
      prompt: `${prompt}. Smooth cinematic motion, gentle camera movement, atmospheric.`,
      image_url: imageUrl,
    },
    pollInterval: 3000,
  });

  const data = result.data as { video: { url: string } };
  if (!data.video?.url) {
    throw new Error("No video generated");
  }

  return data.video.url;
}
