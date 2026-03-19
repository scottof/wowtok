import { notFound } from "next/navigation";
import { SeoPageTemplate } from "@/components/seo/seo-page-template";
import { allSeoPages, getSeoPageBySlug } from "@/config/seo-pages";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo/locale-urls";

export function generateStaticParams() {
  return allSeoPages.map((p) => ({ seoSlug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ seoSlug: string }>;
}): Promise<Metadata> {
  const { seoSlug } = await params;
  const page = getSeoPageBySlug(seoSlug);
  if (!page) return {};

  const t = await getTranslations(page.translationNamespace);
  const locale = await getLocale();
  const pagePath = `/${seoSlug}`;
  const pageUrl = getLocalizedUrl(locale, pagePath);

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: pageUrl,
      languages: getLanguageAlternates(pagePath),
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: pageUrl,
      type: "website",
    },
  };
}

export default async function SeoPage({
  params,
}: {
  params: Promise<{ seoSlug: string }>;
}) {
  const { seoSlug } = await params;
  const page = getSeoPageBySlug(seoSlug);
  if (!page) notFound();

  return <SeoPageTemplate slug={seoSlug} />;
}
