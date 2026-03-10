import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, tutorials, and insights about AI video creation, TikTok content strategy, and growing your audience.",
};

const posts = [
  {
    slug: "how-to-create-viral-tiktok-videos-with-ai",
    title: "How to Create Viral TikTok Videos with AI in 2026",
    excerpt:
      "Learn how AI is transforming content creation and how you can use WowTok to generate engaging TikTok videos from simple text prompts.",
    date: "2026-02-15",
    readTime: "5 min read",
  },
  {
    slug: "best-tiktok-themes-for-engagement",
    title: "The 10 Best TikTok Video Themes for Maximum Engagement",
    excerpt:
      "Discover which video themes drive the most views, likes, and followers on TikTok. From horror to comedy, find your niche.",
    date: "2026-02-10",
    readTime: "4 min read",
  },
  {
    slug: "ai-voiceover-tips-for-short-videos",
    title: "AI Voiceover Tips: Making Your Short Videos Sound Professional",
    excerpt:
      "Master the art of AI narration for TikTok and Reels. Voice selection, pacing, and scripting techniques that work.",
    date: "2026-02-05",
    readTime: "6 min read",
  },
];

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
            <p className="mt-3 text-muted-foreground">
              Tips, tutorials, and insights about AI video creation.
            </p>
          </div>

          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.slug} className="group">
                <Link
                  href={`/blog/${post.slug}`}
                  className="block rounded-xl border border-border/60 p-6 transition-all hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
                >
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
                  <h2 className="mt-2 text-xl font-semibold group-hover:text-violet-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
