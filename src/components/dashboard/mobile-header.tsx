"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  PlusCircle,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const linkKeys = [
  { href: "/dashboard", labelKey: "myVideos", icon: LayoutDashboard },
  { href: "/dashboard/create", labelKey: "createVideo", icon: PlusCircle },
  { href: "/dashboard/billing", labelKey: "billing", icon: CreditCard },
  { href: "/dashboard/settings", labelKey: "settings", icon: Settings },
] as const;

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Dashboard");

  async function handleSignOut() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border/40 bg-muted/20 px-4 md:hidden">
        <Logo href="/dashboard" />
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b border-border/40 px-6">
            <SheetTitle>
              <Logo href="/dashboard" />
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {linkKeys.map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {t(link.labelKey)}
                </Link>
              );
            })}
          </nav>

          <SheetFooter className="border-t border-border/40">
            <div className="px-1">
              <LanguageSwitcher />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full cursor-pointer justify-start gap-3 text-muted-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              {t("signOut")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
