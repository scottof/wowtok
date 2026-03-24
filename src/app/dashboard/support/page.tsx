import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { SupportContent } from "@/components/dashboard/support-content";
import { getDashboardViewer } from "@/lib/dashboard/server";

export default async function SupportPage() {
  const locale = await getLocale();
  const { authUser, dbUser } = await getDashboardViewer();

  const hasSubscription =
    !!dbUser?.subscription && dbUser.subscription.status === "ACTIVE";

  // Only users with an active subscription can access support
  if (!hasSubscription) {
    redirect(`/${locale}/dashboard`);
  }

  const plan = dbUser?.subscription?.plan ?? null;

  return <SupportContent plan={plan} userEmail={authUser?.email ?? ""} />;
}
