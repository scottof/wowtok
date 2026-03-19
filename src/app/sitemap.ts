import type { MetadataRoute } from "next";
import { getPostsByLocale } from "@/data/blog";
import { allSeoPages } from "@/config/seo-pages";
import { locales } from "@/i18n/config";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo/locale-urls";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { path: "/", changeFrequency: "weekly" as const, priority: 1 },
    {
      path: "/ai-tiktok-generators",
      changeFrequency: "weekly" as const,
      priority: 0.85,
    },
    { path: "/pricing", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/blog", changeFrequency: "weekly" as const, priority: 0.8 },
    { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const localizedStaticPages = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: getLocalizedUrl(locale, page.path),
      alternates: {
        languages: getLanguageAlternates(page.path),
      },
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    }))
  );

  const localizedBlogPages = (
    await Promise.all(
      locales.map(async (locale) => {
        const posts = await getPostsByLocale(locale);
        return posts.map((post) => ({
          url: getLocalizedUrl(locale, `/blog/${post.slug}`),
          alternates: {
            languages: getLanguageAlternates(`/blog/${post.slug}`),
          },
          lastModified: new Date(post.date),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }));
      })
    )
  ).flat();

  const localizedSeoPages = allSeoPages.flatMap((page) =>
    locales.map((locale) => ({
      url: getLocalizedUrl(locale, `/${page.slug}`),
      alternates: {
        languages: getLanguageAlternates(`/${page.slug}`),
      },
      changeFrequency: "weekly" as const,
      priority: page.priority,
    }))
  );

  return [
    ...localizedStaticPages,
    ...localizedBlogPages,
    ...localizedSeoPages,
  ];
}
