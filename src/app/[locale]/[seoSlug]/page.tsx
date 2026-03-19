import {
  generateSeoMetadata,
  generateSeoStaticParams,
  SeoPage,
} from "../../seo-page";

export function generateStaticParams() {
  return generateSeoStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ seoSlug: string }>;
}) {
  const { seoSlug } = await params;
  return generateSeoMetadata({ seoSlug });
}

export default async function LocalizedSeoPage({
  params,
}: {
  params: Promise<{ seoSlug: string }>;
}) {
  const { seoSlug } = await params;
  return <SeoPage seoSlug={seoSlug} />;
}
