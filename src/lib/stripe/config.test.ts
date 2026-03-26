import { describe, expect, it } from "vitest";
import {
  defaultCurrency,
  estimateCreditsForVideo,
  formatPrice,
  getCreditTopupPricing,
  getCurrencyByPriceId,
  getCurrencyForLocale,
  getMonthlyCreditsLimit,
  getPlan,
  getPlanPricing,
  plans,
} from "./config";

describe("stripe/config", () => {
  describe("plans", () => {
    it("contains exactly 3 plans: STARTER, CREATOR, PRO", () => {
      expect(plans).toHaveLength(3);
      expect(plans.map((p) => p.id)).toEqual(["STARTER", "CREATOR", "PRO"]);
    });

    it("each plan has the correct monthly credits and USD price", () => {
      const starter = plans.find((p) => p.id === "STARTER")!;
      const creator = plans.find((p) => p.id === "CREATOR")!;
      const pro = plans.find((p) => p.id === "PRO")!;

      expect(starter.monthlyCredits).toBe(30);
      expect(starter.pricing.USD.price).toBe(29);

      expect(creator.monthlyCredits).toBe(100);
      expect(creator.pricing.USD.price).toBe(59);

      expect(pro.monthlyCredits).toBe(250);
      expect(pro.pricing.USD.price).toBe(149);
    });
  });

  describe("getPlan", () => {
    it("finds a plan by ID (case-insensitive)", () => {
      expect(getPlan("starter")?.id).toBe("STARTER");
      expect(getPlan("CREATOR")?.id).toBe("CREATOR");
      expect(getPlan("Pro")?.id).toBe("PRO");
    });

    it("returns undefined for an unknown plan ID", () => {
      expect(getPlan("ENTERPRISE")).toBeUndefined();
      expect(getPlan("")).toBeUndefined();
    });
  });

  describe("getMonthlyCreditsLimit", () => {
    it("returns the correct limit for each plan", () => {
      expect(getMonthlyCreditsLimit("STARTER")).toBe(30);
      expect(getMonthlyCreditsLimit("CREATOR")).toBe(100);
      expect(getMonthlyCreditsLimit("PRO")).toBe(250);
    });

    it("returns 0 for an unknown plan", () => {
      expect(getMonthlyCreditsLimit("NONEXISTENT")).toBe(0);
    });
  });

  describe("estimateCreditsForVideo", () => {
    it("uses the length-based credit tiers", () => {
      expect(estimateCreditsForVideo("a".repeat(10))).toBe(8);
      expect(estimateCreditsForVideo("a".repeat(250))).toBe(8);
      expect(estimateCreditsForVideo("a".repeat(251))).toBe(10);
      expect(estimateCreditsForVideo("a".repeat(450))).toBe(10);
      expect(estimateCreditsForVideo("a".repeat(451))).toBe(12);
      expect(estimateCreditsForVideo("a".repeat(600))).toBe(12);
    });
  });

  describe("getCreditTopupPricing", () => {
    it("prices top-ups dynamically per required credit", () => {
      expect(getCreditTopupPricing(8, "USD")).toMatchObject({
        amountInCents: 799,
        price: 7.99,
      });
      expect(getCreditTopupPricing(10, "EUR")).toMatchObject({
        amountInCents: 999,
        price: 9.99,
      });
      expect(getCreditTopupPricing(12, "USD")).toMatchObject({
        amountInCents: 1199,
        price: 11.99,
      });
      expect(getCreditTopupPricing(2, "USD")).toMatchObject({
        amountInCents: 199,
        price: 1.99,
      });
    });
  });

  describe("currency helpers", () => {
    it("maps European locales to EUR", () => {
      expect(getCurrencyForLocale("de")).toBe("EUR");
      expect(getCurrencyForLocale("fr-FR")).toBe("EUR");
      expect(getCurrencyForLocale("it")).toBe("EUR");
      expect(getCurrencyForLocale("es")).toBe("EUR");
      expect(getCurrencyForLocale("pt")).toBe("EUR");
    });

    it("falls back to USD for non-European locales", () => {
      expect(getCurrencyForLocale("en")).toBe(defaultCurrency);
      expect(getCurrencyForLocale("ar")).toBe(defaultCurrency);
      expect(getCurrencyForLocale("zh")).toBe(defaultCurrency);
      expect(getCurrencyForLocale("ko")).toBe(defaultCurrency);
    });

    it("returns pricing for both currencies", () => {
      expect(getPlanPricing("STARTER", "USD")?.price).toBe(29);
      expect(getPlanPricing("STARTER", "EUR")?.price).toBe(29);
    });

    it("detects the currency from stored Stripe price IDs", () => {
      const starter = getPlan("STARTER")!;
      starter.pricing.USD.stripePriceId = "price_starter_usd_test";
      starter.pricing.EUR.stripePriceId = "price_starter_eur_test";

      expect(getCurrencyByPriceId("price_starter_usd_test")).toBe("USD");
      expect(getCurrencyByPriceId("price_starter_eur_test")).toBe("EUR");
      expect(getCurrencyByPriceId("price_unknown")).toBeUndefined();
    });

    it("formats Portuguese prices using pt-PT conventions", () => {
      expect(formatPrice(59, "EUR", "pt")).toBe("59\xa0€");
    });
  });
});
