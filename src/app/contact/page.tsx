import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Footer } from "@/components/shared/footer";
import { Navbar } from "@/components/shared/navbar";
import { ContactForm } from "@/components/contact/contact-form";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo/locale-urls";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("ContactPage");
  const url = getLocalizedUrl(locale, "/contact");
  const title = t("metaTitle");
  const description = t("metaDescription");

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: getLanguageAlternates("/contact"),
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
  };
}

export default async function ContactPage() {
  const t = await getTranslations("ContactPage");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex rounded-full border border-border/60 bg-muted/40 px-4 py-1.5 text-sm text-muted-foreground">
            {t("eyebrow")}
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
