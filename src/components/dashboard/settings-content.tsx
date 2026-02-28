"use client";

import { useTranslations } from "next-intl";
import { Separator } from "@/components/ui/separator";

interface SettingsContentProps {
  name: string | null;
  email: string;
  createdAt: string | null;
}

export function SettingsContent({ name, email, createdAt }: SettingsContentProps) {
  const t = useTranslations("Dashboard");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("settingsTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settingsSubtitle")}
        </p>
      </div>

      <div className="max-w-xl space-y-6">
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h3 className="font-semibold">{t("profile")}</h3>
          <Separator className="my-4" />

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">{t("name")}</label>
              <p className="mt-1 text-sm font-medium">
                {name || t("notSet")}
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">{t("email")}</label>
              <p className="mt-1 text-sm font-medium">{email}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">{t("memberSince")}</label>
              <p className="mt-1 text-sm font-medium">
                {createdAt
                  ? new Date(createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h3 className="font-semibold">{t("account")}</h3>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            {t("accountInfo")}
          </p>
        </div>
      </div>
    </div>
  );
}
