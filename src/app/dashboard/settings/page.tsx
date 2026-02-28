import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { SettingsContent } from "@/components/dashboard/settings-content";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user!.id },
  });

  return (
    <SettingsContent
      name={dbUser?.name ?? null}
      email={dbUser?.email ?? ""}
      createdAt={dbUser?.createdAt ? dbUser.createdAt.toISOString() : null}
    />
  );
}
