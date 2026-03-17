"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";

interface SeoComparisonProps {
  namespace: string;
}

export function SeoComparison({ namespace }: SeoComparisonProps) {
  const t = useTranslations(namespace);

  const rows = [];
  for (let i = 1; i <= 6; i++) {
    try {
      const aspect = t(`compRow${i}Aspect`);
      const manual = t(`compRow${i}Manual`);
      const ai = t(`compRow${i}Ai`);
      rows.push({ aspect, manual, ai });
    } catch {
      break;
    }
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("comparisonTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("comparisonSubtitle")}
          </p>
        </div>

        <motion.div
          className="mt-10 overflow-hidden rounded-2xl border border-border/60"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  {t("compHeaderAspect")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  {t("compHeaderManual")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold gradient-text">
                  {t("compHeaderAi")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="px-6 py-4 text-sm font-medium">
                    {row.aspect}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-400 shrink-0" />
                      {row.manual}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 shrink-0" />
                      {row.ai}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
