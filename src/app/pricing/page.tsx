import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { PricingCards } from "@/components/landing/pricing-cards";
import { FAQ } from "@/components/landing/faq";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Promptok. Start free, upgrade when you're ready. Cancel anytime.",
};

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Navbar />
      <main className="pt-8">
        <PricingCards isLoggedIn={!!user} />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
