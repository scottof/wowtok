"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Wand2,
  Mic,
  Palette,
  Zap,
  Download,
  Layers,
} from "lucide-react";

const featureIcons = [Wand2, Palette, Mic, Zap, Layers, Download];

interface SeoFeaturesProps {
  namespace: string;
}

export function SeoFeatures({ namespace }: SeoFeaturesProps) {
  const t = useTranslations(namespace);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("featuresTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("featuresSubtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featureIcons.map((Icon, i) => {
            const num = i + 1;
            return (
              <motion.div
                key={i}
                className="group rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-100">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-semibold">
                  {t(`feature${num}Title`)}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {t(`feature${num}Desc`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
