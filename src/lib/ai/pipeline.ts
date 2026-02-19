import { prisma } from "@/lib/prisma";
import { generateScenes } from "./openai";
import { generateImage, generateVideoFromImage } from "./fal";
import { generateVoiceover } from "./elevenlabs";
import { getTheme } from "@/config/themes";
import type { Scene } from "@/types";

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

export async function runPipeline(videoId: string) {
  try {
    const video = await prisma.video.findUniqueOrThrow({
      where: { id: videoId },
    });

    const themeConfig = getTheme(video.theme);
    const style = themeConfig?.style || "cinematic, high quality";

    // Step 1: Generate scenes
    await updateVideoStatus(videoId, "SCENES");
    const scenes = await generateScenes(
      video.theme,
      video.prompt,
      video.narratorText
    );

    await updateVideoStatus(videoId, "SCENES", {
      scenes: JSON.parse(JSON.stringify(scenes)),
    });

    // Step 2: Generate images for each scene
    await updateVideoStatus(videoId, "IMAGES");
    const scenesWithImages: Scene[] = [];

    for (const scene of scenes) {
      const imageUrl = await generateImage(scene.visualDescription, style);
      scenesWithImages.push({ ...scene, imageUrl });
    }

    await updateVideoStatus(videoId, "IMAGES", {
      scenes: JSON.parse(JSON.stringify(scenesWithImages)),
    });

    // Step 3: Generate video clips from images
    await updateVideoStatus(videoId, "VIDEO");
    const scenesWithVideos: Scene[] = [];

    for (const scene of scenesWithImages) {
      const videoUrl = await generateVideoFromImage(
        scene.imageUrl!,
        scene.visualDescription
      );
      scenesWithVideos.push({ ...scene, videoUrl });
    }

    await updateVideoStatus(videoId, "VIDEO", {
      scenes: JSON.parse(JSON.stringify(scenesWithVideos)),
    });

    // Step 4: Generate voiceover
    await updateVideoStatus(videoId, "VOICEOVER");
    const audioBuffer = await generateVoiceover(
      video.narratorText,
      video.voiceId || "adam"
    );

    // Upload audio to Supabase Storage
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const audioPath = `videos/${videoId}/voiceover.mp3`;
    await supabase.storage
      .from("media")
      .upload(audioPath, audioBuffer, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    const { data: audioUrlData } = supabase.storage
      .from("media")
      .getPublicUrl(audioPath);

    // Step 5: Compose final video
    await updateVideoStatus(videoId, "COMPOSING");

    // For MVP: Use the first generated video clip as the main video
    // In production, this would use Remotion to compose all clips + audio + captions
    const finalVideoUrl = scenesWithVideos[0]?.videoUrl;

    // Upload thumbnail (first scene image)
    const thumbnailUrl = scenesWithImages[0]?.imageUrl || null;

    // Calculate estimated duration
    const estimatedDuration = Math.ceil(video.narratorText.length / 15);

    // Mark as completed
    await updateVideoStatus(videoId, "COMPLETED", {
      videoUrl: finalVideoUrl,
      thumbnailUrl,
      duration: estimatedDuration,
      scenes: JSON.parse(JSON.stringify(scenesWithVideos)),
    });

    return { success: true, videoUrl: finalVideoUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await updateVideoStatus(videoId, "FAILED", {
      errorMessage: message,
    });
    throw error;
  }
}
