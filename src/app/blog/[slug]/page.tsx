import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Button } from "@/components/ui/button";
import { BlogCtaButton } from "@/components/blog/cta-button";
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
            {(() => {
              const blocks = post.content.split("\n\n");
              const elements: React.ReactNode[] = [];
              let i = 0;

              const renderInline = (text: string) => {
                const parts = text.split(/(\*\*[^*]+\*\*)/g);
                return parts.map((part, j) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={j} className="text-foreground font-semibold">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                );
              };

              while (i < blocks.length) {
                const block = blocks[i];

                if (block.startsWith("## ")) {
                  elements.push(
                    <h2 key={i} className="mb-3 mt-8 text-xl font-semibold">
                      {block.replace("## ", "")}
                    </h2>
                  );
                  i++;
                } else if (/^\d+\.\s/.test(block)) {
                  // Collect consecutive ordered list items
                  const items: string[] = [];
                  while (i < blocks.length && /^\d+\.\s/.test(blocks[i])) {
                    items.push(blocks[i].replace(/^\d+\.\s/, ""));
                    i++;
                  }
                  elements.push(
                    <ol key={`ol-${i}`} className="mb-4 list-decimal list-inside space-y-2">
                      {items.map((item, j) => (
                        <li key={j} className="text-muted-foreground leading-relaxed">
                          {renderInline(item)}
                        </li>
                      ))}
                    </ol>
                  );
                } else {
                  elements.push(
                    <p key={i} className="mb-4 text-muted-foreground leading-relaxed">
                      {renderInline(block)}
                    </p>
                  );
                  i++;
                }
              }

              return elements;
            })()}
          </div>

          <div className="mt-12 rounded-xl gradient-bg p-8 text-center text-white">
            <h3 className="text-xl font-bold">{t("ctaTitle")}</h3>
            <p className="mt-2 text-white/80">{t("ctaDescription")}</p>
            <BlogCtaButton slug={slug} label={t("ctaButton")} />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
