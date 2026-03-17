"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface SeoFaqProps {
  namespace: string;
  faqCount: number;
}

export function SeoFaq({ namespace, faqCount }: SeoFaqProps) {
  const t = useTranslations(namespace);

  const faqs = Array.from({ length: faqCount }, (_, i) => ({
    qKey: `faq${i + 1}Q`,
    aKey: `faq${i + 1}A`,
  }));

  return (
    <section className="bg-muted/30 py-20">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("faqTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("faqSubtitle")}</p>
        </motion.div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {t(faq.qKey)}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {t(faq.aKey)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
