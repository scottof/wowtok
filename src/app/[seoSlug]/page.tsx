import { notFound } from "next/navigation";
import { SeoPageTemplate } from "@/components/seo/seo-page-template";
import { allSeoPages, getSeoPageBySlug } from "@/config/seo-pages";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

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

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${siteConfig.url}/${seoSlug}`,
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: `${siteConfig.url}/${seoSlug}`,
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
