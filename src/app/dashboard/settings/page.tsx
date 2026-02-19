import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Separator } from "@/components/ui/separator";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user!.id },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <div className="max-w-xl space-y-6">
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h3 className="font-semibold">Profile</h3>
          <Separator className="my-4" />

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <p className="mt-1 text-sm font-medium">
                {dbUser?.name || "Not set"}
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="mt-1 text-sm font-medium">{dbUser?.email}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Member since</label>
              <p className="mt-1 text-sm font-medium">
                {dbUser?.createdAt
                  ? new Date(dbUser.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-6">
          <h3 className="font-semibold">Account</h3>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            To update your email or password, use the authentication provider
            settings. Contact support for account deletion requests.
          </p>
        </div>
      </div>
    </div>
  );
}
