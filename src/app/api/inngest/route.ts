import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { generateVideo } from "@/inngest/functions/generate-video";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateVideo],
});
