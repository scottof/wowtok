import { describe, expect, it, vi } from "vitest";
import {
  consumePurchasedCreditsForVideo,
  getPurchasedCreditsAvailable,
  restorePurchasedCreditsForFailedVideo,
} from "./credits";

describe("credits helpers", () => {
  it("sums remaining purchased credits for a user", async () => {
    const aggregate = vi.fn().mockResolvedValue({
      _sum: { creditsRemaining: 14 },
    });

    const total = await getPurchasedCreditsAvailable("user_123", {
      creditPurchase: { aggregate },
    } as never);

    expect(total).toBe(14);
    expect(aggregate).toHaveBeenCalledWith({
      where: {
        userId: "user_123",
        creditsRemaining: { gt: 0 },
      },
      _sum: {
        creditsRemaining: true,
      },
    });
  });

  it("consumes purchased credits from the oldest purchases first", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: "purchase_1",
        creditsRemaining: 3,
        createdAt: new Date("2026-01-01"),
      },
      {
        id: "purchase_2",
        creditsRemaining: 6,
        createdAt: new Date("2026-01-02"),
      },
    ]);
    const update = vi.fn().mockResolvedValue(undefined);
    const create = vi.fn().mockResolvedValue(undefined);

    const billingSource = await consumePurchasedCreditsForVideo(
      {
        creditPurchase: { findMany, update },
        creditUsage: { create },
      } as never,
      "user_123",
      "video_123",
      8
    );

    expect(billingSource).toBe("CREDIT_PURCHASE");
    expect(update).toHaveBeenNthCalledWith(1, {
      where: { id: "purchase_1" },
      data: {
        creditsRemaining: 0,
        status: "EXHAUSTED",
      },
    });
    expect(update).toHaveBeenNthCalledWith(2, {
      where: { id: "purchase_2" },
      data: {
        creditsRemaining: 1,
        status: "COMPLETED",
      },
    });
    expect(create).toHaveBeenNthCalledWith(1, {
      data: {
        creditPurchaseId: "purchase_1",
        videoId: "video_123",
        creditsConsumed: 3,
      },
    });
    expect(create).toHaveBeenNthCalledWith(2, {
      data: {
        creditPurchaseId: "purchase_2",
        videoId: "video_123",
        creditsConsumed: 5,
      },
    });
  });

  it("throws when there are not enough purchased credits", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: "purchase_1",
        creditsRemaining: 4,
        createdAt: new Date("2026-01-01"),
      },
    ]);

    await expect(
      consumePurchasedCreditsForVideo(
        {
          creditPurchase: {
            findMany,
            update: vi.fn(),
          },
          creditUsage: { create: vi.fn() },
        } as never,
        "user_123",
        "video_123",
        8
      )
    ).rejects.toThrow("INSUFFICIENT_PURCHASED_CREDITS");
  });

  it("restores purchased credits once for a failed purchased-credit video", async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: "video_123",
      billingSource: "CREDIT_PURCHASE",
      creditRestoredAt: null,
      creditUsages: [
        { creditPurchaseId: "purchase_1", creditsConsumed: 3 },
        { creditPurchaseId: "purchase_2", creditsConsumed: 5 },
      ],
    });
    const purchaseUpdate = vi.fn().mockResolvedValue(undefined);
    const videoUpdate = vi.fn().mockResolvedValue(undefined);

    const restored = await restorePurchasedCreditsForFailedVideo(
      {
        video: { findUnique, update: videoUpdate },
        creditPurchase: { update: purchaseUpdate },
      } as never,
      "video_123"
    );

    expect(restored).toBe(true);
    expect(purchaseUpdate).toHaveBeenNthCalledWith(1, {
      where: { id: "purchase_1" },
      data: {
        creditsRemaining: { increment: 3 },
        status: "COMPLETED",
      },
    });
    expect(purchaseUpdate).toHaveBeenNthCalledWith(2, {
      where: { id: "purchase_2" },
      data: {
        creditsRemaining: { increment: 5 },
        status: "COMPLETED",
      },
    });
    expect(videoUpdate).toHaveBeenCalledWith({
      where: { id: "video_123" },
      data: {
        creditRestoredAt: expect.any(Date),
      },
    });
  });

  it("does nothing when the failed video was not paid with purchased credits", async () => {
    const purchaseUpdate = vi.fn();
    const videoUpdate = vi.fn();

    const restored = await restorePurchasedCreditsForFailedVideo(
      {
        video: {
          findUnique: vi.fn().mockResolvedValue({
            id: "video_123",
            billingSource: "SUBSCRIPTION",
            creditRestoredAt: null,
            creditUsages: [],
          }),
          update: videoUpdate,
        },
        creditPurchase: { update: purchaseUpdate },
      } as never,
      "video_123"
    );

    expect(restored).toBe(false);
    expect(purchaseUpdate).not.toHaveBeenCalled();
    expect(videoUpdate).not.toHaveBeenCalled();
  });
});
