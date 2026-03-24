import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  Play,
  Ghost,
  Sparkles,
  Laugh,
  Rocket,
  Theater,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

const mockThemes = [
  { icon: Ghost, key: "mockupThemeHorror" as const, selected: true },
  { icon: Sparkles, key: "mockupThemeFantasy" as const, selected: false },
  { icon: Laugh, key: "mockupThemeComedy" as const, selected: false },
  { icon: Rocket, key: "mockupThemeSciFi" as const, selected: false },
  { icon: Theater, key: "mockupThemeDrama" as const, selected: false },
  { icon: Search, key: "mockupThemeMystery" as const, selected: false },
];

const stepKeys = [
  "mockupStepTheme",
  "mockupStepPrompt",
  "mockupStepNarration",
  "mockupStepVoice",
  "mockupStepReview",
] as const;

export async function Hero() {
  const t = await getTranslations("Hero");

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 hidden h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-100/60 to-transparent blur-3xl md:block" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Play className="h-3 w-3 fill-violet-600 text-violet-600" />
            {t("badge")}
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {t("titleStart")}{" "}
            <span className="gradient-text">{t("titleHighlight")}</span>{" "}
            {t("titleEnd")}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            {t("description")}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="gradient-bg w-full border-0 text-white hover:opacity-90 sm:w-auto"
              asChild
            >
              <Link href="/signup">
                {t("cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full cursor-pointer sm:w-auto"
              asChild
            >
              <a href="#how-it-works">{t("secondaryCta")}</a>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="relative rounded-2xl border border-border/60 bg-card p-5 shadow-2xl shadow-violet-500/10">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-3 text-sm font-medium text-muted-foreground">
                {t("mockupTitle")}
              </span>
            </div>

            <div className="mb-5 flex items-center gap-1.5">
              {stepKeys.map((stepKey, i) => (
                <div key={stepKey} className="flex items-center gap-1.5">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      i === 0
                        ? "gradient-bg text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`hidden text-xs sm:inline ${
                      i === 0
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t(stepKey)}
                  </span>
                  {i < 4 && (
                    <div className="mx-1 hidden h-px w-4 bg-border sm:block" />
                  )}
                </div>
              ))}
            </div>

            <p className="mb-3 text-sm font-medium">{t("mockupChooseTheme")}</p>

            <div className="grid grid-cols-3 gap-2">
              {mockThemes.map((theme) => {
                const Icon = theme.icon;
                return (
                  <div
                    key={theme.key}
                    className={`rounded-lg border p-3 text-center transition-colors ${
                      theme.selected
                        ? "border-violet-400 bg-violet-50 shadow-sm dark:bg-violet-950/30"
                        : "border-border/60 bg-muted/30"
                    }`}
                  >
                    <Icon
                      className={`mx-auto h-5 w-5 ${
                        theme.selected
                          ? "text-violet-600"
                          : "text-muted-foreground"
                      }`}
                    />
                    <p
                      className={`mt-1.5 text-xs font-medium ${
                        theme.selected
                          ? "text-violet-900 dark:text-violet-100"
                          : ""
                      }`}
                    >
                      {t(theme.key)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="mb-1 text-xs text-muted-foreground">
                {t("mockupPromptLabel")}
              </p>
              <p className="text-sm text-foreground/80">
                {t("mockupPromptExample")}
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="gradient-bg rounded-lg px-5 py-2 text-sm font-medium text-white">
                {t("mockupNext")}
                <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
