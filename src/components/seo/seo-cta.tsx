"use client";

import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

interface SeoCtaProps {
  namespace: string;
  slug: string;
}

export function SeoCta({ namespace, slug }: SeoCtaProps) {
  const t = useTranslations(namespace);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          className="relative overflow-hidden rounded-3xl gradient-bg px-8 py-16 text-center text-white md:px-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent)]" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">
              {t("ctaSubtitle")}
            </p>
            <Button
              size="lg"
              className="mt-8 bg-white text-violet-700 hover:bg-white/90 cursor-pointer"
              asChild
              onClick={() =>
                trackEvent("seo_cta_click", { page: slug })
              }
            >
              <Link href="/signup">
                {t("ctaButton")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
