import { inngest } from "../client";
import { runPipeline } from "@/lib/ai/pipeline";

export const generateVideo = inngest.createFunction(
  {
    id: "generate-video",
    name: "Generate Video",
    retries: 1,
  },
  { event: "video/generate" },
  async ({ event }) => {
    const { videoId } = event.data;
    await runPipeline(videoId);
    return { success: true, videoId };
  }
);
