import { describe, it, expect } from "vitest";
import { plans, getPlan, getVideosLimit } from "./config";

describe("stripe/config", () => {
  describe("plans", () => {
    it("contains exactly 3 plans: STARTER, CREATOR, PRO", () => {
      expect(plans).toHaveLength(3);
      expect(plans.map((p) => p.id)).toEqual(["STARTER", "CREATOR", "PRO"]);
    });

    it("each plan has correct videosPerMonth and price", () => {
      const starter = plans.find((p) => p.id === "STARTER")!;
      const creator = plans.find((p) => p.id === "CREATOR")!;
      const pro = plans.find((p) => p.id === "PRO")!;

      expect(starter.videosPerMonth).toBe(5);
      expect(starter.price).toBe(29);

      expect(creator.videosPerMonth).toBe(20);
      expect(creator.price).toBe(59);

      expect(pro.videosPerMonth).toBe(50);
      expect(pro.price).toBe(149);
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
      expect(getVideosLimit("STARTER")).toBe(5);
      expect(getVideosLimit("CREATOR")).toBe(20);
      expect(getVideosLimit("PRO")).toBe(50);
    });

    it("returns 0 for an unknown plan", () => {
      expect(getVideosLimit("NONEXISTENT")).toBe(0);
    });
  });
});
