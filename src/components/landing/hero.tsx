"use client";

import Link from "next/link";
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
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const mockThemes = [
  { icon: Ghost, name: "Horror", selected: true },
  { icon: Sparkles, name: "Fantasy", selected: false },
  { icon: Laugh, name: "Comedy", selected: false },
  { icon: Rocket, name: "Sci-Fi", selected: false },
  { icon: Theater, name: "Drama", selected: false },
  { icon: Search, name: "Mystery", selected: false },
];

export function Hero() {
  const t = useTranslations("Hero");

  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-100/60 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pt-28">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/#how-it-works">{t("secondaryCta")}</Link>
            </Button>
          </div>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          className="mx-auto mt-16 max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative rounded-2xl border border-border/60 bg-card p-5 shadow-2xl shadow-violet-500/10">
            {/* Window chrome */}
            <div className="mb-4 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-3 text-sm font-medium text-muted-foreground">
                Create New Video
              </span>
            </div>

            {/* Step indicator */}
            <div className="mb-5 flex items-center gap-1.5">
              {["Theme", "Prompt", "Narration", "Voice", "Review"].map(
                (step, i) => (
                  <div key={step} className="flex items-center gap-1.5">
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
                      {step}
                    </span>
                    {i < 4 && (
                      <div className="mx-1 hidden h-px w-4 bg-border sm:block" />
                    )}
                  </div>
                ),
              )}
            </div>

            {/* Choose theme label */}
            <p className="mb-3 text-sm font-medium">Choose your theme</p>

            {/* Theme grid */}
            <div className="grid grid-cols-3 gap-2">
              {mockThemes.map((theme) => {
                const Icon = theme.icon;
                return (
                  <div
                    key={theme.name}
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
                        theme.selected ? "text-violet-900 dark:text-violet-100" : ""
                      }`}
                    >
                      {theme.name}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Prompt input preview */}
            <div className="mt-4 rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="mb-1 text-xs text-muted-foreground">
                What&apos;s your video about?
              </p>
              <p className="text-sm text-foreground/80">
                A haunted lighthouse on a foggy night...
              </p>
            </div>

            {/* Next button */}
            <div className="mt-4 flex justify-end">
              <div className="gradient-bg rounded-lg px-5 py-2 text-sm font-medium text-white">
                Next
                <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
