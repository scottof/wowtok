import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getVideosLimit } from "@/lib/stripe/config";
import { CreateVideoForm } from "@/components/dashboard/create-video-form";

export default async function CreateVideoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user!.id },
    include: { subscription: true },
  });

  const plan = dbUser?.subscription?.plan ?? "STARTER";

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const usage = await prisma.usageRecord.findUnique({
    where: { userId_month: { userId: dbUser!.id, month } },
  });

  const used = usage?.videosGenerated ?? 0;
  const limit = usage?.videosLimit ?? (dbUser?.subscription ? getVideosLimit(dbUser.subscription.plan) : 0);

  return <CreateVideoForm plan={plan} used={used} limit={limit} />;
}
