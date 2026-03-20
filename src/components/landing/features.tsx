import {
  Wand2,
  Mic,
  Palette,
  Zap,
  Download,
  Layers,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

const featureKeys = [
  { icon: Wand2, titleKey: "aiScript", descKey: "aiScriptDesc" },
  { icon: Palette, titleKey: "themes", descKey: "themesDesc" },
  { icon: Mic, titleKey: "voices", descKey: "voicesDesc" },
  { icon: Zap, titleKey: "video", descKey: "videoDesc" },
  { icon: Layers, titleKey: "captions", descKey: "captionsDesc" },
  { icon: Download, titleKey: "download", descKey: "downloadDesc" },
];

export async function Features() {
  const t = await getTranslations("Features");

  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureKeys.map((feature) => (
            <div
              key={feature.titleKey}
              className="group rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-100">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold">{t(feature.titleKey)}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
