import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { PricingCards } from "@/components/landing/pricing-cards";
import { FAQ } from "@/components/landing/faq";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for Promptok. Start free, upgrade when you're ready. Cancel anytime.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-8">
        <PricingCards />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
