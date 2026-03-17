"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Play, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { videoThemes } from "@/config/themes";
import { trackEvent } from "@/lib/analytics";

interface SeoDemoProps {
  namespace: string;
  themeId?: string;
}

export function SeoDemo({ namespace, themeId }: SeoDemoProps) {
  const t = useTranslations(namespace);
  const [selectedTheme, setSelectedTheme] = useState(themeId || "horror");
  const [isGenerating, setIsGenerating] = useState(false);
  const theme = videoThemes.find((th) => th.id === selectedTheme);

  function handleGenerate() {
    setIsGenerating(true);
    trackEvent("seo_demo_click", { theme: selectedTheme });
    setTimeout(() => setIsGenerating(false), 2000);
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("demoTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("demoSubtitle")}</p>
        </motion.div>

        <motion.div
          className="mt-10 rounded-2xl border border-border/60 bg-card p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          viewport={{ once: true }}
        >
          {/* Theme selector */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium">
              {t("demoSelectTheme")}
            </label>
            <div className="flex flex-wrap gap-2">
              {videoThemes.slice(0, 6).map((th) => (
                <button
                  key={th.id}
                  onClick={() => setSelectedTheme(th.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    selectedTheme === th.id
                      ? "gradient-bg text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {th.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mock preview */}
          <div className="relative aspect-[9/16] max-h-[320px] mx-auto w-[180px] rounded-xl bg-gradient-to-b from-gray-900 to-gray-800 overflow-hidden">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/70">
              <Play className="h-10 w-10 mb-2" />
              <p className="text-xs text-center px-3">
                {theme?.name} {t("demoPreview")}
              </p>
            </div>
          </div>

          {/* Generate button */}
          <div className="mt-6 text-center">
            <Button
              size="lg"
              className="gradient-bg border-0 text-white hover:opacity-90 cursor-pointer"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 animate-spin" />
                  {t("demoGenerating")}
                </span>
              ) : (
                t("demoButton")
              )}
            </Button>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("demoSignup")}{" "}
              <Link
                href="/signup"
                className="text-violet-600 hover:underline font-medium"
              >
                {t("demoSignupLink")}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
