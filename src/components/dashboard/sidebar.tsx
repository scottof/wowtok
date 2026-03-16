"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  CreditCard,
  Settings,
  LogOut,
  LifeBuoy,
  MessageSquare,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { PlanSelectionDialog } from "@/components/dashboard/plan-selection-dialog";
import { FeedbackModal } from "@/components/dashboard/feedback-modal";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const allLinks = [
  { href: "/dashboard", labelKey: "myVideos", icon: LayoutDashboard, requiresSub: false },
  { href: "/dashboard/create", labelKey: "createVideo", icon: PlusCircle, requiresSub: false },
  { href: "/dashboard/billing", labelKey: "billing", icon: CreditCard, requiresSub: false },
  { href: "/dashboard/support", labelKey: "support", icon: LifeBuoy, requiresSub: true },
  { href: "/dashboard/settings", labelKey: "settings", icon: Settings, requiresSub: false },
] as const;

interface SidebarProps {
  hasSubscription: boolean;
}

export function Sidebar({ hasSubscription }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Dashboard");
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const tFeedback = useTranslations("Feedback");

  const linkKeys = allLinks.filter(
    (link) => !link.requiresSub || hasSubscription
  );

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <aside className="hidden md:flex h-full w-64 flex-col border-r border-border/40 bg-muted/20">
        <div className="flex h-16 items-center px-6">
          <Logo href="/dashboard" />
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {linkKeys.map((link) => {
            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(link.href);

            // Intercept Create Video click for unsubscribed users
            if (link.href === "/dashboard/create" && !hasSubscription) {
              return (
                <button
                  key={link.href}
                  onClick={() => setShowPlanDialog(true)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                    isActive
                      ? "bg-accent font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {t(link.labelKey)}
                </button>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
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

        <div className="border-t border-border/40 p-3 space-y-2">
          <div className="px-1">
            <LanguageSwitcher />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full cursor-pointer justify-start gap-3 text-muted-foreground"
            onClick={() => setShowFeedback(true)}
          >
            <MessageSquare className="h-4 w-4" />
            {tFeedback("feedback")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full cursor-pointer justify-start gap-3 text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            {t("signOut")}
          </Button>
        </div>
      </aside>

      <PlanSelectionDialog
        open={showPlanDialog}
        onOpenChange={setShowPlanDialog}
      />

      <FeedbackModal
        open={showFeedback}
        onOpenChange={setShowFeedback}
      />
    </>
  );
}
