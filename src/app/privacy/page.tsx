import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { siteConfig } from "@/config/site";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Privacy");
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${siteConfig.url}/privacy`,
    },
  };
}

export default function PrivacyPage() {
  const t = useTranslations("Privacy");

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
          <ul>
            <li>
              <strong>{t("s1Item1Label")}</strong> {t("s1Item1Text")}
            </li>
            <li>
              <strong>{t("s1Item2Label")}</strong> {t("s1Item2Text")}
            </li>
            <li>
              <strong>{t("s1Item3Label")}</strong> {t("s1Item3Text")}
            </li>
            <li>
              <strong>{t("s1Item4Label")}</strong> {t("s1Item4Text")}
            </li>
            <li>
              <strong>{t("s1Item5Label")}</strong> {t("s1Item5Text")}
            </li>
          </ul>

          <h2>{t("s2Title")}</h2>
          <ul>
            <li>{t("s2Item1")}</li>
            <li>{t("s2Item2")}</li>
            <li>{t("s2Item3")}</li>
            <li>{t("s2Item4")}</li>
            <li>{t("s2Item5")}</li>
            <li>{t("s2Item6")}</li>
          </ul>

          <h2>{t("s3Title")}</h2>
          <p>{t("s3Text")}</p>
          <ul>
            <li>
              <strong>{t("s3Item1Label")}</strong> {t("s3Item1Text")}
            </li>
            <li>
              <strong>{t("s3Item2Label")}</strong> {t("s3Item2Text")}
            </li>
          </ul>

          <h2>{t("s4Title")}</h2>
          <p>{t("s4Text")}</p>

          <h2>{t("s5Title")}</h2>
          <p>{t("s5Text")}</p>

          <h2>{t("s6Title")}</h2>
          <ul>
            <li>{t("s6Item1")}</li>
            <li>{t("s6Item2")}</li>
            <li>{t("s6Item3")}</li>
          </ul>

          <h2>{t("s7Title")}</h2>
          <p>{t("s7Text")}</p>
          <ul>
            <li>{t("s7Item1")}</li>
            <li>{t("s7Item2")}</li>
            <li>{t("s7Item3")}</li>
            <li>{t("s7Item4")}</li>
            <li>{t("s7Item5")}</li>
          </ul>
          <p>
            {t("s7Contact")}{" "}
            <a
              href="mailto:hello@wowtok.com"
              className="text-foreground underline"
            >
              hello@wowtok.com
            </a>
            .
          </p>

          <h2>{t("s8Title")}</h2>
          <p>{t("s8Text")}</p>

          <h2>{t("s9Title")}</h2>
          <p>{t("s9Text")}</p>

          <h2>{t("s10Title")}</h2>
          <p>{t("s10Text")}</p>

          <h2>{t("s11Title")}</h2>
          <p>{t("s11Text")}</p>

          <h2>{t("s12Title")}</h2>
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
