import { describe, it, expect } from "vitest";
import {
  defaultCurrency,
  getCurrencyByPriceId,
  getCurrencyForLocale,
  getPlan,
  getPlanPricing,
  getVideosLimit,
  plans,
} from "./config";

describe("stripe/config", () => {
  describe("plans", () => {
    it("contains exactly 3 plans: STARTER, CREATOR, PRO", () => {
      expect(plans).toHaveLength(3);
      expect(plans.map((p) => p.id)).toEqual(["STARTER", "CREATOR", "PRO"]);
    });

    it("each plan has correct videosPerMonth and USD price", () => {
      const starter = plans.find((p) => p.id === "STARTER")!;
      const creator = plans.find((p) => p.id === "CREATOR")!;
      const pro = plans.find((p) => p.id === "PRO")!;

      expect(starter.videosPerMonth).toBe(3);
      expect(starter.pricing.USD.price).toBe(29);

      expect(creator.videosPerMonth).toBe(10);
      expect(creator.pricing.USD.price).toBe(59);

      expect(pro.videosPerMonth).toBe(25);
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

  describe("getVideosLimit", () => {
    it("returns the correct limit for each plan", () => {
      expect(getVideosLimit("STARTER")).toBe(3);
      expect(getVideosLimit("CREATOR")).toBe(10);
      expect(getVideosLimit("PRO")).toBe(25);
    });

    it("returns 0 for an unknown plan", () => {
      expect(getVideosLimit("NONEXISTENT")).toBe(0);
    });
  });

  describe("currency helpers", () => {
    it("maps European locales to EUR", () => {
      expect(getCurrencyForLocale("de")).toBe("EUR");
      expect(getCurrencyForLocale("fr-FR")).toBe("EUR");
      expect(getCurrencyForLocale("it")).toBe("EUR");
      expect(getCurrencyForLocale("es")).toBe("EUR");
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
  });
});
