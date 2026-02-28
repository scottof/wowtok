"use client";

import { useTranslations } from "next-intl";

interface UsageBarProps {
  used: number;
  limit: number;
}

export function UsageBar({ used, limit }: UsageBarProps) {
  const t = useTranslations("Dashboard");
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{t("videosThisMonth")}</span>
        <span className="font-medium">
          {used} / {limit}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full gradient-bg transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
