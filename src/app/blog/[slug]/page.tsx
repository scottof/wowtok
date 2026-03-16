import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { getPostsByLocale, getPostBySlug } from "@/data/blog";
import { getUserLocale } from "@/i18n/locale";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const { posts } = await import("@/data/blog/en");
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getUserLocale();
  const post = await getPostBySlug(locale, slug);
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
  const locale = await getUserLocale();
  const t = await getTranslations("Blog");
  const post = await getPostBySlug(locale, slug);

  if (!post) {
    notFound();
  }

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
        <article className="mx-auto max-w-3xl px-6">
          <Button variant="ghost" size="sm" className="mb-8" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToBlog")}
            </Link>
          </Button>

          <header className="mb-8">
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
                return null;
              }
              return (
                <p
                  key={i}
                  className="mb-4 text-muted-foreground leading-relaxed"
                >
                  {paragraph}
                </p>
              );
            })}
          </div>

          <div className="mt-12 rounded-xl gradient-bg p-8 text-center text-white">
            <h3 className="text-xl font-bold">{t("ctaTitle")}</h3>
            <p className="mt-2 text-white/80">{t("ctaDescription")}</p>
            <Button
              className="mt-4 bg-white text-violet-700 hover:bg-white/90"
              asChild
            >
              <Link href="/signup">{t("ctaButton")}</Link>
            </Button>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
