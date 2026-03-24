"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = useTranslations("Nav");
  const pathname = usePathname();

  const navLinks = [
    { href: "/#features", label: t("features") },
    { href: "/#how-it-works", label: t("howItWorks") },
    { href: "/pricing", label: t("pricing") },
    { href: "/#faq", label: t("faq") },
  ];

  // Check if we're on the landing page (could be / or /en, /es, etc.)
  const isLandingPage = pathname === "/" || /^\/[a-z]{2}$/.test(pathname);

  function handleHashClick(href: string) {
    const id = href.slice(2);
    if (isLandingPage) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = href;
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 md:bg-background/80 md:backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isHash = link.href.startsWith("/#");
            return isHash && isLandingPage ? (
              <button
                key={link.href}
                onClick={() => handleHashClick(link.href)}
                className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </button>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher direction="down" />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button size="sm" className="gradient-bg border-0 text-white hover:opacity-90" asChild>
            <Link href="/signup">{t("getStarted")}</Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-background px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isHash = link.href.startsWith("/#");
              return isHash && isLandingPage ? (
                <button
                  key={link.href}
                  onClick={() => {
                    handleHashClick(link.href);
                    setMobileOpen(false);
                  }}
                  className="cursor-pointer py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="flex flex-col gap-2 pt-3">
              <LanguageSwitcher direction="down" />
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">{t("login")}</Link>
              </Button>
              <Button size="sm" className="gradient-bg border-0 text-white" asChild>
                <Link href="/signup">{t("getStarted")}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
