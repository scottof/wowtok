import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import type { Metadata } from "next";
import { getDashboardViewer } from "@/lib/dashboard/server";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const { authUser, dbUser } = await getDashboardViewer();

  if (!authUser || !dbUser) {
    redirect(`/${locale}/login`);
  }

  const hasSubscription =
    !!dbUser.subscription && dbUser.subscription.status === "ACTIVE";

  return (
    <div className="flex h-screen">
      <Sidebar hasSubscription={hasSubscription} />
      <div className="flex flex-1 flex-col">
        <MobileHeader hasSubscription={hasSubscription} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
