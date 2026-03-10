import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string;
}

const posts: Record<string, BlogPost> = {
  "how-to-create-viral-tiktok-videos-with-ai": {
    slug: "how-to-create-viral-tiktok-videos-with-ai",
    title: "How to Create Viral TikTok Videos with AI in 2026",
    excerpt:
      "Learn how AI is transforming content creation and how you can use WowTok to generate engaging TikTok videos from simple text prompts.",
    date: "2026-02-15",
    readTime: "5 min read",
    content: `AI-powered video creation has revolutionized how content creators approach TikTok. What once required hours of filming, editing, and post-production can now be accomplished in minutes with the right tools.

## The Rise of AI Video Generation

The landscape of content creation has shifted dramatically. Creators no longer need expensive equipment or advanced editing skills to produce compelling short-form video content. AI models can now generate realistic images, animate them into video clips, and even produce natural-sounding voiceovers.

## How WowTok Changes the Game

WowTok streamlines the entire process into three simple steps:

1. **Choose your theme** — Select from horror, fantasy, comedy, sci-fi, and more. Each theme applies a curated visual style to your content.

2. **Write your prompt** — Describe what your video should be about. Our AI generates a compelling script and breaks it into cinematic scenes.

3. **Generate and download** — AI creates images, animates them into video clips, adds voiceover narration with captions, and delivers a ready-to-post vertical video.

## Tips for Viral AI Content

The most successful AI-generated TikTok videos share common traits: they hook viewers in the first 2 seconds, maintain a consistent visual style, and use narration that creates curiosity or emotional engagement.

Start creating AI videos today and see the difference for yourself.`,
  },
  "best-tiktok-themes-for-engagement": {
    slug: "best-tiktok-themes-for-engagement",
    title: "The 10 Best TikTok Video Themes for Maximum Engagement",
    excerpt:
      "Discover which video themes drive the most views, likes, and followers on TikTok. From horror to comedy, find your niche.",
    date: "2026-02-10",
    readTime: "4 min read",
    content: `Choosing the right theme for your TikTok content can make or break your engagement rates. After analyzing thousands of AI-generated videos, here are the themes that consistently perform best.

## Top Performing Themes

**Horror** consistently generates high engagement due to its ability to create suspense and keep viewers watching until the end. The fear factor drives comments and shares.

**Fantasy** appeals to a broad audience with its escapist qualities. Magical worlds and epic narratives encourage saves and rewatches.

**Comedy** remains the most versatile theme, working across all demographics and encouraging the most shares.

**Sci-Fi** attracts a dedicated niche audience that tends to be highly engaged, with higher-than-average comment rates.

**Mystery** creates curiosity-driven engagement. Viewers feel compelled to watch until the reveal, boosting completion rates — one of TikTok's key algorithm signals.

## Matching Theme to Audience

The key is consistency. Pick a theme that resonates with your target audience and create content regularly within that niche. The TikTok algorithm rewards creators who demonstrate expertise in a specific content area.`,
  },
  "ai-voiceover-tips-for-short-videos": {
    slug: "ai-voiceover-tips-for-short-videos",
    title: "AI Voiceover Tips: Making Your Short Videos Sound Professional",
    excerpt:
      "Master the art of AI narration for TikTok and Reels. Voice selection, pacing, and scripting techniques that work.",
    date: "2026-02-05",
    readTime: "6 min read",
    content: `The voiceover is often the most important element of a TikTok video. It guides the viewer's attention, sets the mood, and delivers your message. Here's how to make the most of AI voices.

## Choosing the Right Voice

Match your voice to your content theme. Deep, authoritative voices work well for horror and drama. Energetic voices suit comedy and motivational content. Calm, clear voices are ideal for educational material.

## Writing for AI Narration

AI voices perform best with well-structured text. Keep sentences short and punchy. Use natural language — write like you speak, not like you write. Break long paragraphs into shorter segments for better pacing.

## Pacing and Timing

For TikTok videos, aim for 15-20 words per scene (about 4-6 seconds of narration). This leaves room for visual impact and prevents overwhelming the viewer with too much information.

## Script Structure

Open with a hook — a question, a bold statement, or an intriguing scenario. Build tension or interest in the middle. End with a satisfying conclusion or call to action.

The best AI-narrated TikTok videos feel natural and engaging, as if a real person is telling you a story.`,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts[slug];

  if (!post) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="py-16">
        <article className="mx-auto max-w-3xl px-6">
          <Button variant="ghost" size="sm" className="mb-8" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to blog
            </Link>
          </Button>

          <header className="mb-8">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              <span>&middot;</span>
              <span>{post.readTime}</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {post.title}
            </h1>
          </header>

          <div className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed prose-strong:text-foreground prose-li:text-muted-foreground">
            {post.content.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={i} className="mb-3 mt-8 text-xl font-semibold">
                    {paragraph.replace("## ", "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                return null; // Skip standalone bold lines handled in lists
              }
              return (
                <p key={i} className="mb-4 text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          <div className="mt-12 rounded-xl gradient-bg p-8 text-center text-white">
            <h3 className="text-xl font-bold">Ready to create AI videos?</h3>
            <p className="mt-2 text-white/80">
              Start generating TikTok videos with WowTok today.
            </p>
            <Button
              className="mt-4 bg-white text-violet-700 hover:bg-white/90"
              asChild
            >
              <Link href="/signup">Get started free</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
