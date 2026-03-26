import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  constructEvent,
  retrieveSubscription,
  prismaCreditPurchaseUpsert,
  prismaSubscriptionFindFirst,
  prismaSubscriptionUpsert,
  prismaSubscriptionUpdateMany,
  prismaUsageUpsert,
  headersMock,
} = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  retrieveSubscription: vi.fn(),
  prismaCreditPurchaseUpsert: vi.fn(),
  prismaSubscriptionFindFirst: vi.fn(),
  prismaSubscriptionUpsert: vi.fn(),
  prismaSubscriptionUpdateMany: vi.fn(),
  prismaUsageUpsert: vi.fn(),
  headersMock: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/lib/stripe/client", () => ({
  stripe: {
    webhooks: {
      constructEvent,
    },
    subscriptions: {
      retrieve: retrieveSubscription,
    },
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    creditPurchase: {
      upsert: prismaCreditPurchaseUpsert,
    },
    subscription: {
      findFirst: prismaSubscriptionFindFirst,
      upsert: prismaSubscriptionUpsert,
      updateMany: prismaSubscriptionUpdateMany,
    },
    usageRecord: {
      upsert: prismaUsageUpsert,
    },
  },
}));

vi.mock("@/lib/env", () => ({
  env: {
    STRIPE_WEBHOOK_SECRET: "whsec_test",
    STRIPE_STARTER_PRICE_ID: "price_starter_usd",
    STRIPE_STARTER_PRICE_ID_EUR: "price_starter_eur",
    STRIPE_CREATOR_PRICE_ID: "price_creator_usd",
    STRIPE_CREATOR_PRICE_ID_EUR: "price_creator_eur",
    STRIPE_PRO_PRICE_ID: "price_pro_usd",
    STRIPE_PRO_PRICE_ID_EUR: "price_pro_eur",
  },
}));

import { POST } from "./route";

function createHeaders(signature = "sig_test") {
  return {
    get: vi.fn((name: string) =>
      name === "stripe-signature" ? signature : null
    ),
  };
}

describe("api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headersMock.mockResolvedValue(createHeaders());
    prismaCreditPurchaseUpsert.mockResolvedValue(undefined);
    prismaSubscriptionFindFirst.mockResolvedValue({ userId: "user_123" });
    prismaSubscriptionUpsert.mockResolvedValue(undefined);
    prismaSubscriptionUpdateMany.mockResolvedValue(undefined);
    prismaUsageUpsert.mockResolvedValue(undefined);
  });

  it("persists completed subscription checkout sessions with EUR creator pricing", async () => {
    const periodStart = 1_710_000_000;
    const periodEnd = 1_712_592_000;

    constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          subscription: "sub_123",
          metadata: { userId: "user_123" },
        },
      },
    });

    retrieveSubscription.mockResolvedValue({
      status: "active",
      cancel_at_period_end: false,
      cancel_at: null,
      items: {
        data: [
          {
            price: { id: "price_creator_eur" },
            current_period_start: periodStart,
            current_period_end: periodEnd,
          },
        ],
      },
    });

    const response = await POST(
      new Request("https://www.wowtok.com/api/webhooks/stripe", {
        method: "POST",
        body: "payload",
      })
    );

    expect(response.status).toBe(200);
    expect(constructEvent).toHaveBeenCalledWith(
      "payload",
      "sig_test",
      "whsec_test"
    );
    expect(retrieveSubscription).toHaveBeenCalledWith("sub_123");
    expect(prismaSubscriptionUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user_123" },
        update: expect.objectContaining({
          stripePriceId: "price_creator_eur",
          plan: "CREATOR",
          status: "ACTIVE",
          cancelAtPeriodEnd: false,
        }),
        create: expect.objectContaining({
          userId: "user_123",
          stripePriceId: "price_creator_eur",
          plan: "CREATOR",
          status: "ACTIVE",
        }),
      })
    );
    expect(prismaUsageUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { creditsLimit: 100 },
        create: expect.objectContaining({
          userId: "user_123",
          creditsUsed: 0,
          creditsLimit: 100,
        }),
      })
    );
  });

  it("stores completed credit top-up checkout sessions", async () => {
    constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          amount_total: 799,
          currency: "eur",
          payment_intent: "pi_123",
          metadata: {
            userId: "user_123",
            checkoutType: "CREDIT_TOPUP",
            credits: "8",
          },
        },
      },
    });

    const response = await POST(
      new Request("https://www.wowtok.com/api/webhooks/stripe", {
        method: "POST",
        body: "payload",
      })
    );

    expect(response.status).toBe(200);
    expect(prismaCreditPurchaseUpsert).toHaveBeenCalledWith({
      where: { stripeCheckoutSessionId: "cs_test_123" },
      update: {
        stripePaymentIntentId: "pi_123",
        creditsPurchased: 8,
        creditsRemaining: 8,
        amount: 799,
        currency: "EUR",
        status: "COMPLETED",
      },
      create: {
        userId: "user_123",
        stripeCheckoutSessionId: "cs_test_123",
        stripePaymentIntentId: "pi_123",
        creditsPurchased: 8,
        creditsRemaining: 8,
        amount: 799,
        currency: "EUR",
        status: "COMPLETED",
      },
    });
    expect(retrieveSubscription).not.toHaveBeenCalled();
    expect(prismaSubscriptionUpsert).not.toHaveBeenCalled();
  });

  it("updates subscriptions on customer.subscription.updated", async () => {
    constructEvent.mockReturnValue({
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_456",
          status: "past_due",
          cancel_at_period_end: true,
          cancel_at: 1_712_000_000,
          items: {
            data: [
              {
                price: { id: "price_pro_usd" },
                current_period_start: 1_710_000_000,
                current_period_end: 1_712_592_000,
              },
            ],
          },
        },
      },
    });

    const response = await POST(
      new Request("https://www.wowtok.com/api/webhooks/stripe", {
        method: "POST",
        body: "payload",
      })
    );

    expect(response.status).toBe(200);
    expect(prismaSubscriptionUpdateMany).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: "sub_456" },
      data: expect.objectContaining({
        stripePriceId: "price_pro_usd",
        plan: "PRO",
        status: "PAST_DUE",
        cancelAtPeriodEnd: true,
      }),
    });
    expect(prismaSubscriptionFindFirst).toHaveBeenCalledWith({
      where: { stripeSubscriptionId: "sub_456" },
      select: { userId: true },
    });
    expect(prismaUsageUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { creditsLimit: 250 },
        create: expect.objectContaining({
          userId: "user_123",
          creditsUsed: 0,
          creditsLimit: 250,
        }),
      })
    );
  });

  it("returns 400 for invalid webhook signatures", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    const response = await POST(
      new Request("https://www.wowtok.com/api/webhooks/stripe", {
        method: "POST",
        body: "payload",
      })
    );

    expect(response.status).toBe(400);
    expect(prismaCreditPurchaseUpsert).not.toHaveBeenCalled();
    expect(prismaSubscriptionUpsert).not.toHaveBeenCalled();
    expect(prismaSubscriptionUpdateMany).not.toHaveBeenCalled();
  });
});
