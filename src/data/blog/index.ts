export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content: string;
}

const postModules: Record<string, () => Promise<{ posts: BlogPost[] }>> = {
  en: () => import("./en"),
  es: () => import("./es"),
  it: () => import("./it"),
  fr: () => import("./fr"),
  ko: () => import("./ko"),
  ar: () => import("./ar"),
  zh: () => import("./zh"),
  de: () => import("./de"),
  ru: () => import("./ru"),
  pt: () => import("./pt"),
};

export async function getPostsByLocale(locale: string): Promise<BlogPost[]> {
  const loader = postModules[locale] || postModules.en;
  const { posts } = await loader();
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPostBySlug(
  locale: string,
  slug: string
): Promise<BlogPost | undefined> {
  const posts = await getPostsByLocale(locale);
  return posts.find((p) => p.slug === slug);
}
