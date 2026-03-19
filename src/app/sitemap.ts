import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getPostsByLocale } from "@/data/blog";
import { allSeoPages } from "@/config/seo-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  const posts = await getPostsByLocale("en");
  const blogPages = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...blogPages,
    ...allSeoPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      changeFrequency: "weekly" as const,
      priority: page.priority,
    })),
  ];
}
