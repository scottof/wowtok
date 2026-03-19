import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import {
  getFeaturedSeoPages,
  getThemeSeoPages,
  getUtilitySeoPages,
} from "@/config/seo-pages";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo/locale-urls";

async function translateSeoCards(
  pages: ReturnType<typeof getFeaturedSeoPages>
) {
  return Promise.all(
    pages.map(async (page) => {
      const tPage = await getTranslations(page.translationNamespace);
      return {
        slug: page.slug,
        title: tPage("h1"),
        description: tPage("metaDescription"),
      };
    })
  );
}

function ToolsSection({
  title,
  subtitle,
  cards,
}: {
  title: string;
  subtitle: string;
  cards: Array<{ slug: string; title: string; description: string }>;
}) {
  return (
    <section>
      <div className="mb-8 max-w-3xl">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.slug}
            href={`/${card.slug}`}
            className="group rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
          >
            <h3 className="text-lg font-semibold transition-colors group-hover:text-violet-600">
              {card.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("ToolsHub");
  const url = getLocalizedUrl(locale, "/ai-tiktok-generators");

  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: {
      canonical: url,
      languages: getLanguageAlternates("/ai-tiktok-generators"),
    },
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("subtitle"),
    },
  };
}

export default async function AiTikTokGeneratorsPage() {
  const t = await getTranslations("ToolsHub");

  const [featuredCards, themeCards, utilityCards] = await Promise.all([
    translateSeoCards(getFeaturedSeoPages()),
    translateSeoCards(getThemeSeoPages()),
    translateSeoCards(getUtilitySeoPages()),
  ]);

  return (
    <>
      <Navbar />
      <main className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-600">
              {t("eyebrow")}
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <div className="mt-14 space-y-16">
            <ToolsSection
              title={t("featuredTitle")}
              subtitle={t("featuredSubtitle")}
              cards={featuredCards}
            />
            <ToolsSection
              title={t("themesTitle")}
              subtitle={t("themesSubtitle")}
              cards={themeCards}
            />
            <ToolsSection
              title={t("formatsTitle")}
              subtitle={t("formatsSubtitle")}
              cards={utilityCards}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
