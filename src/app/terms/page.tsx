import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { getLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo/locale-urls";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Terms");
  const locale = await getLocale();
  const url = getLocalizedUrl(locale, "/terms");
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: url,
      languages: getLanguageAlternates("/terms"),
    },
  };
}

export default function TermsPage() {
  const t = useTranslations("Terms");

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("lastUpdated")}
        </p>

        <div className="prose prose-sm mt-8 max-w-none text-muted-foreground [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:mt-3 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-6">
          <h2>{t("s1Title")}</h2>
          <p>{t("s1Text")}</p>

          <h2>{t("s2Title")}</h2>
          <p>{t("s2Text")}</p>

          <h2>{t("s3Title")}</h2>
          <p>{t("s3Text")}</p>

          <h2>{t("s4Title")}</h2>
          <ul>
            <li>{t("s4Item1")}</li>
            <li>{t("s4Item2")}</li>
            <li>{t("s4Item3")}</li>
            <li>{t("s4Item4")}</li>
            <li>{t("s4Item5")}</li>
          </ul>

          <h2>{t("s5Title")}</h2>
          <ul>
            <li>{t("s5Item1")}</li>
            <li>{t("s5Item2")}</li>
            <li>{t("s5Item3")}</li>
          </ul>

          <h2>{t("s6Title")}</h2>
          <p>{t("s6Text")}</p>
          <ul>
            <li>{t("s6Item1")}</li>
            <li>{t("s6Item2")}</li>
            <li>{t("s6Item3")}</li>
            <li>{t("s6Item4")}</li>
            <li>{t("s6Item5")}</li>
          </ul>

          <h2>{t("s7Title")}</h2>
          <p>{t("s7Text")}</p>

          <h2>{t("s8Title")}</h2>
          <p>{t("s8Text")}</p>

          <h2>{t("s9Title")}</h2>
          <p>{t("s9Text")}</p>

          <h2>{t("s10Title")}</h2>
          <p>{t("s10Text")}</p>

          <h2>{t("s11Title")}</h2>
          <p>{t("s11Text")}</p>

          <h2 id="contact" className="scroll-mt-24">{t("s12Title")}</h2>
          <p>
            {t("s12Text")}{" "}
            <a
              href="mailto:hello@wowtok.com"
              className="text-foreground underline"
            >
              hello@wowtok.com
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
