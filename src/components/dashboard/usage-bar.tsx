"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface UsageBarProps {
  used: number;
  limit: number;
}

export function UsageBar({ used, limit }: UsageBarProps) {
  const t = useTranslations("Dashboard");
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isNearLimit = percentage >= 80 && percentage < 100;
  const isAtLimit = percentage >= 100;

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        isAtLimit
          ? "border-red-200 bg-red-50"
          : isNearLimit
            ? "border-amber-200 bg-amber-50"
            : "border-border/60 bg-card"
      )}
    >
      <div className="flex items-center justify-between text-sm">
        <span className={cn(
          isAtLimit ? "text-red-700" : isNearLimit ? "text-amber-700" : "text-muted-foreground"
        )}>
          {t("creditsThisMonth")}
        </span>
        <div className="flex items-center gap-3">
          <span className={cn(
            "font-medium",
            isAtLimit ? "text-red-700" : isNearLimit ? "text-amber-700" : ""
          )}>
            {used} / {limit}
          </span>
          {isAtLimit && (
            <Link
              href="/pricing"
              className="rounded-full bg-red-600 px-3 py-0.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
            >
              {t("upgradeNow")}
            </Link>
          )}
          {isNearLimit && (
            <Link
              href="/pricing"
              className="text-xs font-medium text-amber-700 underline hover:text-amber-800"
            >
              {t("upgradeForMore")}
            </Link>
          )}
        </div>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isAtLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "gradient-bg"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
