"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Lightbulb } from "lucide-react";

interface SeoExamplesProps {
  namespace: string;
}

const cardColors = [
  { border: "border-violet-500/20", badge: "bg-violet-500/10 text-violet-600" },
  { border: "border-pink-500/20", badge: "bg-pink-500/10 text-pink-600" },
  { border: "border-blue-500/20", badge: "bg-blue-500/10 text-blue-600" },
  { border: "border-orange-500/20", badge: "bg-orange-500/10 text-orange-600" },
];

export function SeoExamples({ namespace }: SeoExamplesProps) {
  const t = useTranslations(namespace);

  const examples: { title: string; desc: string }[] = [];
  for (let i = 1; i <= 4; i++) {
    try {
      examples.push({ title: t(`example${i}Title`), desc: t(`example${i}Desc`) });
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
          {examples.map((ex, i) => {
            const colors = cardColors[i % cardColors.length];
            return (
              <motion.div
                key={i}
                className={`group rounded-2xl border ${colors.border} bg-card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-8 h-8 rounded-lg ${colors.badge} flex items-center justify-center`}>
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-snug">{ex.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{ex.desc}</p>
                </div>
                <div className={`mt-auto inline-flex self-start rounded-full px-2.5 py-0.5 text-xs font-medium ${colors.badge}`}>
                  Prompt idea
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
