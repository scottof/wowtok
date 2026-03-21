import { Logo } from "./logo";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { featuredSeoPageSlugs } from "@/config/seo-pages";

export async function Footer() {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");

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
      { label: t("contact"), href: "/privacy#contact" },
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
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
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
