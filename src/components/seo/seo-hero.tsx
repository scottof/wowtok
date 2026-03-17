"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Ghost,
  Sparkles,
  Laugh,
  Rocket,
  Theater,
  Search,
  Heart,
  Zap,
  BookOpen,
  Flame,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const themeIcons: Record<string, LucideIcon> = {
  horror: Ghost,
  fantasy: Sparkles,
  comedy: Laugh,
  scifi: Rocket,
  drama: Theater,
  mystery: Search,
  romance: Heart,
  thriller: Zap,
  educational: BookOpen,
  motivational: Flame,
};

interface SeoHeroProps {
  namespace: string;
  themeId?: string;
}

export function SeoHero({ namespace, themeId }: SeoHeroProps) {
  const t = useTranslations(namespace);
  const Icon = themeId ? themeIcons[themeId] : null;

  return (
    <section className="pt-28 pb-16">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {Icon && (
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Icon className="h-8 w-8" />
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("h1")}
          </h1>
        </motion.div>

        <motion.div
          className="mt-8 space-y-4 text-lg leading-relaxed text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <p>{t("introP1")}</p>
          <p>{t("introP2")}</p>
          <p>{t("introP3")}</p>
        </motion.div>
      </div>
    </section>
  );
}
