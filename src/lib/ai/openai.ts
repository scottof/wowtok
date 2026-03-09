import OpenAI from "openai";
import { getTheme } from "@/config/themes";
import type { Scene } from "@/types";
import { env } from "@/lib/env";

function getOpenAI() {
  return new OpenAI({ apiKey: env.OPENAI_API_KEY });
}

export async function generateScenes(
  theme: string,
  prompt: string,
  narratorText: string
): Promise<Scene[]> {
  const themeConfig = getTheme(theme);
  const style = themeConfig?.style || "cinematic, high quality";

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a video scene director. Break narration text into 5-6 scenes for a TikTok video.
For each scene, provide:
1. The narration text segment for that scene
2. A detailed visual description for AI image generation

Style guide: ${style}

Return valid JSON array with objects: { "index": number, "narration": "text for this scene", "visualDescription": "detailed visual description for image generation" }

Rules:
- ALWAYS create at least 5 scenes, maximum 6
- If the narration text is short, distribute it across 5 scenes with brief narration per scene and expand the visual descriptions to be more detailed and cinematic
- Each scene should be 3-8 seconds when read aloud
- Visual descriptions should be detailed, cinematic, and match the theme
- Include specific details: lighting, colors, camera angle, mood, subjects
- Make each scene visually distinct
- Total scenes: 5-6 (never fewer than 5)`,
      },
      {
        role: "user",
        content: `Theme: ${theme}
Prompt: ${prompt}
Narration text to split into scenes:
${narratorText}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No response from OpenAI");

  const parsed = JSON.parse(content);
  const scenes: Scene[] = (parsed.scenes || parsed).map(
    (s: { index?: number; narration: string; visualDescription: string }, i: number) => ({
      index: s.index ?? i,
      narration: s.narration,
      visualDescription: s.visualDescription,
    })
  );

  return scenes;
}

export async function generateScript(
  theme: string,
  prompt: string
): Promise<string> {
  const themeConfig = getTheme(theme);

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a TikTok script writer. Write engaging, concise narration scripts for short-form videos.
Theme style: ${themeConfig?.description || theme}

Rules:
- Write 300-600 characters of narration text (6-8 sentences)
- Make it engaging and hook the viewer in the first sentence
- Match the theme's tone (horror = eerie, comedy = witty, etc.)
- Write in second person or storytelling voice
- No stage directions, just the narrator's spoken text
- Make it suitable for a 25-35 second TikTok video
- Each sentence should paint a vivid picture that can become a visual scene`,
      },
      {
        role: "user",
        content: `Write a TikTok narration script about: ${prompt}`,
      },
    ],
    temperature: 0.8,
  });

  return response.choices[0].message.content || "";
}
