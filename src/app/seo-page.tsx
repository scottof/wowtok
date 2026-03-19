import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { SeoPageTemplate } from "@/components/seo/seo-page-template";
import { allSeoPages, getSeoPageBySlug } from "@/config/seo-pages";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo/locale-urls";

function stripTrailingBrand(metaTitle: string) {
  return metaTitle
    .replace(/\s*\|\s*WowTok AI\s*$/i, "")
    .replace(/\s*\|\s*WowTok\s*$/i, "");
}

export function generateSeoStaticParams() {
  return allSeoPages.map((page) => ({ seoSlug: page.slug }));
}

export async function generateSeoMetadata({
  seoSlug,
}: {
  seoSlug: string;
}): Promise<Metadata> {
  const page = getSeoPageBySlug(seoSlug);
  if (!page) return {};

  const t = await getTranslations(page.translationNamespace);
  const locale = await getLocale();
  const pagePath = `/${seoSlug}`;
  const pageUrl = getLocalizedUrl(locale, pagePath);
  const title = stripTrailingBrand(t("metaTitle"));

  return {
    title,
    description: t("metaDescription"),
    alternates: {
      canonical: pageUrl,
      languages: getLanguageAlternates(pagePath),
    },
    openGraph: {
      title,
      description: t("metaDescription"),
      url: pageUrl,
      type: "website",
    },
  };
}

export async function SeoPage({
  seoSlug,
}: {
  seoSlug: string;
}) {
  const page = getSeoPageBySlug(seoSlug);
  if (!page) notFound();

  return <SeoPageTemplate slug={seoSlug} />;
}
