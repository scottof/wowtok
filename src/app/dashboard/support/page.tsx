import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SupportContent } from "@/components/dashboard/support-content";

export default async function SupportPage() {
  const locale = await getLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user!.id },
    include: { subscription: true },
  });

  const hasSubscription =
    !!dbUser?.subscription && dbUser.subscription.status === "ACTIVE";

  // Only users with an active subscription can access support
  if (!hasSubscription) {
    redirect(`/${locale}/dashboard`);
  }

  const plan = dbUser?.subscription?.plan ?? null;

  return <SupportContent plan={plan} userEmail={user?.email ?? ""} />;
}
