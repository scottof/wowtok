import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

async function ensureDashboardUserRecord(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
    include: { subscription: true },
  });

  if (existingUser) {
    return existingUser;
  }

  return prisma.user.create({
    data: {
      supabaseId: user.id,
      email: user.email!,
      name:
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined),
      avatarUrl: user.user_metadata?.avatar_url as string | undefined,
    },
    include: { subscription: true },
  });
}

export const getDashboardViewer = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authUser: null, dbUser: null };
  }

  const dbUser = await ensureDashboardUserRecord(user);

  return { authUser: user, dbUser };
});

export function getCurrentUsageMonth(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
