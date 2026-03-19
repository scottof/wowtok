"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, Sparkles, Mic, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { trackEvent } from "@/lib/analytics";

interface SeoDemoProps {
  namespace: string;
  themeId?: string;
}

const steps = [
  { icon: Sparkles, color: "text-violet-500", bg: "bg-violet-500/10" },
  { icon: Mic, color: "text-pink-500", bg: "bg-pink-500/10" },
  { icon: Video, color: "text-blue-500", bg: "bg-blue-500/10" },
];

export function SeoDemo({ namespace }: SeoDemoProps) {
  const t = useTranslations(namespace);

  const stepData = [
    { key: "step1", ...steps[0] },
    { key: "step2", ...steps[1] },
    { key: "step3", ...steps[2] },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="mx-auto max-w-5xl px-6">
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
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t("demoSubtitle")}
          </p>
        </motion.div>

        {/* 3-step flow */}
        <div className="mt-14 grid gap-4 sm:grid-cols-3 items-center">
          {stepData.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex sm:flex-col items-center gap-4">
                <motion.div
                  className="rounded-2xl border border-border/60 bg-card p-6 flex-1 sm:w-full"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.15 }}
                  viewport={{ once: true }}
                >
                  <div className={`w-10 h-10 rounded-xl ${step.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    {t(`demoSelectTheme`).split(" ")[0]} {i + 1}
                  </div>
                  <h3 className="font-semibold text-sm mb-1">
                    {t(`step${i + 1}Title`)}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(`step${i + 1}Desc`)}
                  </p>
                </motion.div>
                {i < 2 && (
                  <ArrowRight className="hidden sm:block h-5 w-5 text-muted-foreground/40 flex-shrink-0 -mx-2 relative z-10" />
                )}
              </div>
            );
          })}
        </div>

        {/* Phone mockup + CTA */}
        <motion.div
          className="mt-12 flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {/* Prompt example */}
          <div className="w-full max-w-lg rounded-xl border border-border/60 bg-card p-4 font-mono text-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-muted-foreground">Your prompt</span>
            </div>
            <p className="text-muted-foreground">
              <span className="text-violet-500">▶</span>{" "}
              {t("demoPreview")}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">{t("demoGenerating")}</span>
            </div>
          </div>

          <Button
            size="lg"
            className="gradient-bg border-0 text-white hover:opacity-90 cursor-pointer"
            asChild
            onClick={() => trackEvent("seo_demo_cta_click", { namespace })}
          >
            <Link href="/signup">
              {t("demoButton")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground">
            {t("demoSignup")}{" "}
            <Link href="/signup" className="text-violet-600 hover:underline font-medium">
              {t("demoSignupLink")}
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
