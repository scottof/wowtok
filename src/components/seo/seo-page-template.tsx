import { getSeoPageBySlug } from "@/config/seo-pages";
import { getTheme } from "@/config/themes";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { SeoHero } from "./seo-hero";
import { SeoDemo } from "./seo-demo";
import { SeoFeatures } from "./seo-features";
import { SeoHowItWorks } from "./seo-how-it-works";
import { SeoUseCases } from "./seo-use-cases";
import { SeoExamples } from "./seo-examples";
import { SeoComparison } from "./seo-comparison";
import { SeoFaq } from "./seo-faq";
import { SeoCta } from "./seo-cta";
import { SeoSoftwareAppJsonLd, SeoFaqJsonLd } from "./seo-json-ld";

interface SeoPageTemplateProps {
  slug: string;
}

export async function SeoPageTemplate({ slug }: SeoPageTemplateProps) {
  const page = getSeoPageBySlug(slug);
  if (!page) return null;

  const theme = page.themeId ? getTheme(page.themeId) : undefined;

  return (
    <>
      <SeoSoftwareAppJsonLd namespace={page.translationNamespace} slug={slug} />
      <SeoFaqJsonLd
        namespace={page.translationNamespace}
        faqCount={page.faqCount}
      />
      <Navbar />
      <main className="min-h-screen">
        <SeoHero namespace={page.translationNamespace} themeId={theme?.id} />
        <SeoDemo namespace={page.translationNamespace} themeId={theme?.id} />
        <SeoFeatures namespace={page.translationNamespace} />
        <SeoHowItWorks namespace={page.translationNamespace} />
        <SeoUseCases namespace={page.translationNamespace} />
        <SeoExamples namespace={page.translationNamespace} />
        <SeoComparison namespace={page.translationNamespace} />
        <SeoFaq
          namespace={page.translationNamespace}
          faqCount={page.faqCount}
        />
        <SeoCta namespace={page.translationNamespace} slug={slug} />
      </main>
      <Footer />
    </>
  );
}
