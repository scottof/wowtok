"use client";

import Link from "next/link";
import { Logo } from "./logo";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");

  const footerLinks = {
    [t("product")]: [
      { label: tNav("features"), href: "/#features" },
      { label: tNav("pricing"), href: "/pricing" },
      { label: tNav("howItWorks"), href: "/#how-it-works" },
      { label: tNav("faq"), href: "/#faq" },
    ],
    [t("company")]: [
      { label: t("blog"), href: "/blog" },
      { label: t("about"), href: "/#features" },
      { label: t("contact"), href: "mailto:hello@promptok.ai" },
    ],
    [t("legal")]: [
      { label: t("privacy"), href: "/privacy" },
      { label: t("terms"), href: "/terms" },
    ],
  };

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              {t("tagline")}
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-3 text-sm font-medium">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}
