import { describe, it, expect } from "vitest";
import { mapPriceToPlan, mapStatus } from "./mappers";

const priceLookup = {
  starter: ["price_starter_123"],
  creator: ["price_creator_456"],
  pro: ["price_pro_789"],
};

describe("stripe/mappers", () => {
  describe("mapPriceToPlan", () => {
    it("maps each known price ID to the correct plan", () => {
      expect(mapPriceToPlan("price_starter_123", priceLookup)).toBe("STARTER");
      expect(mapPriceToPlan("price_creator_456", priceLookup)).toBe("CREATOR");
      expect(mapPriceToPlan("price_pro_789", priceLookup)).toBe("PRO");
    });

    it("falls back to STARTER for an unrecognized price ID", () => {
      expect(mapPriceToPlan("price_unknown", priceLookup)).toBe("STARTER");
      expect(mapPriceToPlan("", priceLookup)).toBe("STARTER");
    });
  });

  describe("mapStatus", () => {
    it("maps known Stripe statuses to SubStatus values", () => {
      expect(mapStatus("active")).toBe("ACTIVE");
      expect(mapStatus("past_due")).toBe("PAST_DUE");
      expect(mapStatus("canceled")).toBe("CANCELED");
    });

    it("maps trialing and unpaid to the expected terminal statuses", () => {
      expect(mapStatus("trialing")).toBe("ACTIVE");
      expect(mapStatus("unpaid")).toBe("CANCELED");
    });

    it("falls back to INCOMPLETE for unknown statuses", () => {
      expect(mapStatus("")).toBe("INCOMPLETE");
      expect(mapStatus("unknown_status")).toBe("INCOMPLETE");
    });
  });
});
