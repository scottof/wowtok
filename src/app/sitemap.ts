import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const blogSlugs = [
  { slug: "tiktok-algorithm-2026-how-ai-content-ranks", date: "2026-03-13" },
  { slug: "automate-tiktok-content-pipeline-with-ai", date: "2026-03-13" },
  { slug: "how-to-create-viral-tiktok-videos-with-ai", date: "2026-02-15" },
  { slug: "best-tiktok-themes-for-engagement", date: "2026-02-10" },
  { slug: "ai-voiceover-tips-for-short-videos", date: "2026-02-05" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  const blogPages = blogSlugs.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...blogPages,
  ];
}
