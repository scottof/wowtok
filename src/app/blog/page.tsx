import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { getPostsByLocale } from "@/data/blog";
import { getLocale, getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo/locale-urls";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<Metadata> {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const locale = await getLocale();
  const t = await getTranslations("Blog");
  const canonical = getLocalizedUrl(
    locale,
    "/blog",
    currentPage > 1 ? { page: currentPage } : undefined
  );
  const titleBase = "AI TikTok Video Blog";
  const title =
    currentPage > 1 ? `${titleBase} - Page ${currentPage}` : titleBase;
  const description =
    "Read tutorials, prompts, and growth tips for creating TikTok videos with AI, voiceovers, captions, and faceless formats.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: getLanguageAlternates(
        "/blog",
        currentPage > 1 ? { page: currentPage } : undefined
      ),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.ogImage],
    },
  };
}

const POSTS_PER_PAGE = 5;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10));
  const locale = await getLocale();
  const t = await getTranslations("Blog");
  const allPosts = await getPostsByLocale(locale);

  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const dateLocaleMap: Record<string, string> = {
    en: "en-US",
    es: "es-ES",
    it: "it-IT",
    fr: "fr-FR",
    ko: "ko-KR",
    ar: "ar-SA",
    zh: "zh-CN",
    de: "de-DE",
  };

  return (
    <>
      <Navbar />
      <main className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
          </div>

          <div className="space-y-8">
            {paginatedPosts.map((post) => (
              <article key={post.slug} className="group">
                <Link
                  href={`/blog/${post.slug}`}
                  className="block rounded-xl border border-border/60 p-6 transition-all hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
                >
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString(
                        dateLocaleMap[locale] || "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
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

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              {safePage > 1 && (
                <Link
                  href={`/blog?page=${safePage - 1}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Link>
              )}

              <span className="text-sm text-muted-foreground">
                {t("pageOf", { current: safePage, total: totalPages })}
              </span>

              {safePage < totalPages && (
                <Link
                  href={`/blog?page=${safePage + 1}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
