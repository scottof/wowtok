"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";

interface SeoExamplesProps {
  namespace: string;
}

export function SeoExamples({ namespace }: SeoExamplesProps) {
  const t = useTranslations(namespace);

  const examples = [];
  for (let i = 1; i <= 4; i++) {
    try {
      const title = t(`example${i}Title`);
      const desc = t(`example${i}Desc`);
      examples.push({ title, desc });
    } catch {
      break;
    }
  }

  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("examplesTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("examplesSubtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {examples.map((ex, i) => (
            <motion.div
              key={i}
              className="group overflow-hidden rounded-2xl border border-border/60 bg-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative aspect-[9/16] bg-gradient-to-b from-gray-900 to-gray-800">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
                    <Play className="h-5 w-5 ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm">{ex.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{ex.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
