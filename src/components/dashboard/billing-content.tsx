"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPortalSession } from "@/lib/stripe/actions";
import { PlanSelectionDialog } from "@/components/dashboard/plan-selection-dialog";
import { CancellationSurveyModal } from "@/components/dashboard/cancellation-survey-modal";

interface BillingContentProps {
  subscription: {
    status: string;
    plan: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: Date;
  } | null;
  plan: {
    name: string;
    price: number;
    videosPerMonth: number;
  } | null;
}

export function BillingContent({ subscription, plan }: BillingContentProps) {
  const t = useTranslations("Dashboard");
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);

  async function handleManageClick() {
    if (subscription?.cancelAtPeriodEnd) {
      // Already canceling — skip survey, go straight to portal
      await createPortalSession();
    } else {
      setShowSurvey(true);
    }
  }

  async function handleContinueToPortal() {
    await createPortalSession();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{t("billingTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("billingSubtitle")}
        </p>
      </div>

      {subscription && plan ? (
        <div className="space-y-6">
          {/* Current plan */}
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{plan.name} {t("plan")}</h3>
                  <Badge
                    variant={
                      subscription.cancelAtPeriodEnd
                        ? "secondary"
                        : subscription.status === "ACTIVE"
                          ? "default"
                          : "destructive"
                    }
                    className="text-xs"
                  >
                    {subscription.cancelAtPeriodEnd
                      ? t("canceling")
                      : subscription.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  ${plan.price}{t("perMonth")} &middot; {plan.videosPerMonth} {t("videosPerMonth")}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground/30" />
            </div>

            {subscription.cancelAtPeriodEnd ? (
              <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                {t("subscriptionEnds", {
                  date: new Date(subscription.currentPeriodEnd).toLocaleDateString(),
                })}
              </div>
            ) : (
              <div className="mt-4 text-sm text-muted-foreground">
                {t("nextBilling")}{" "}
                <span className="font-medium text-foreground">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Manage subscription */}
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={handleManageClick}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {t("manageSubscription")}
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 py-12 text-center">
          <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <h3 className="mt-4 font-medium">{t("noSubscriptionBilling")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("choosePlan")}
          </p>
          <Button
            className="mt-4 gradient-bg border-0 text-white hover:opacity-90 cursor-pointer"
            size="sm"
            onClick={() => setShowPlanDialog(true)}
          >
            {t("viewPlans")}
          </Button>
        </div>
      )}

      <PlanSelectionDialog
        open={showPlanDialog}
        onOpenChange={setShowPlanDialog}
      />

      <CancellationSurveyModal
        open={showSurvey}
        onOpenChange={setShowSurvey}
        onContinue={handleContinueToPortal}
      />
    </div>
  );
}
