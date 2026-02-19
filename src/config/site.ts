export const siteConfig = {
  name: "Promptok",
  description:
    "Create stunning TikTok videos with AI. Choose a theme, write your prompt, and let AI generate a complete video with voiceover in minutes.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://promptok.ai",
  ogImage: "/og-image.png",
  creator: "@promptok",
  keywords: [
    "AI TikTok video generator",
    "AI video maker",
    "TikTok content creator",
    "AI voiceover video",
    "automated video creation",
    "AI short video generator",
    "TikTok video AI",
    "create TikTok videos with AI",
    "AI video from prompt",
    "text to TikTok video",
  ],
  links: {
    twitter: "https://twitter.com/promptok",
    github: "https://github.com/scottof/promptok",
  },
} as const;
