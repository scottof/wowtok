"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const steps = [
  { step: "01", titleKey: "step1Title", descKey: "step1Desc" },
  { step: "02", titleKey: "step2Title", descKey: "step2Desc" },
  { step: "03", titleKey: "step3Title", descKey: "step3Desc" },
];

interface SeoHowItWorksProps {
  namespace: string;
}

export function SeoHowItWorks({ namespace }: SeoHowItWorksProps) {
  const t = useTranslations(namespace);

  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("howItWorksTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("howItWorksSubtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <div className="mb-4">
                <span className="gradient-text text-5xl font-bold">
                  {step.step}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                {t(step.titleKey)}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(step.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
