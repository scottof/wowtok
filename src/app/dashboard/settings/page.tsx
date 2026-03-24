import { SettingsContent } from "@/components/dashboard/settings-content";
import { getDashboardViewer } from "@/lib/dashboard/server";

export default async function SettingsPage() {
  const { dbUser } = await getDashboardViewer();

  return (
    <SettingsContent
      name={dbUser?.name ?? null}
      email={dbUser?.email ?? ""}
      createdAt={dbUser?.createdAt ? dbUser.createdAt.toISOString() : null}
    />
  );
}
