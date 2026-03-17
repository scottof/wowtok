"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Target, TrendingUp, Users, Megaphone, ShoppingBag, GraduationCap } from "lucide-react";

const useCaseIcons = [Target, TrendingUp, Users, Megaphone, ShoppingBag, GraduationCap];

interface SeoUseCasesProps {
  namespace: string;
}

export function SeoUseCases({ namespace }: SeoUseCasesProps) {
  const t = useTranslations(namespace);

  const cases = [];
  for (let i = 1; i <= 6; i++) {
    try {
      const title = t(`useCase${i}Title`);
      const desc = t(`useCase${i}Desc`);
      cases.push({ title, desc, Icon: useCaseIcons[i - 1] });
    } catch {
      break;
    }
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("useCasesTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("useCasesSubtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((uc, i) => (
            <motion.div
              key={i}
              className="rounded-2xl border border-border/60 bg-card p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <uc.Icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold">{uc.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {uc.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
