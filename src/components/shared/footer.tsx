"use client";

import { Logo } from "./logo";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { featuredSeoPageSlugs } from "@/config/seo-pages";

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");
  const pathname = usePathname();

  const isLandingPage = pathname === "/" || /^\/[a-z]{2}$/.test(pathname);

  function handleHashClick(e: React.MouseEvent, href: string) {
    const id = href.slice(2);
    if (isLandingPage) {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    // On non-landing pages, let the Link navigate normally to /#section
  }

  const generatorLinks = [
    { label: t("toolVideoGenerator"), href: `/${featuredSeoPageSlugs[0]}` },
    { label: t("toolContentGenerator"), href: `/${featuredSeoPageSlugs[1]}` },
    { label: t("toolVoiceover"), href: `/${featuredSeoPageSlugs[2]}` },
    { label: t("viewAllGenerators"), href: "/ai-tiktok-generators" },
  ];

  const footerLinks = {
    [t("product")]: [
      { label: tNav("features"), href: "/#features" },
      { label: tNav("pricing"), href: "/pricing" },
      { label: tNav("howItWorks"), href: "/#how-it-works" },
      { label: tNav("faq"), href: "/#faq" },
    ],
    [t("generators")]: generatorLinks,
    [t("company")]: [
      { label: t("blog"), href: "/blog" },
      { label: t("contact"), href: "mailto:hello@wowtok.com" },
    ],
    [t("legal")]: [
      { label: t("privacy"), href: "/privacy" },
      { label: t("terms"), href: "/terms" },
    ],
  };

  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              {t("tagline")}
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="mb-3 text-sm font-medium">{title}</p>
              <ul className="space-y-2">
                {links.map((link) => {
                  const isHash = link.href.startsWith("/#");
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={isHash ? (e: React.MouseEvent) => handleHashClick(e, link.href) : undefined}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
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
