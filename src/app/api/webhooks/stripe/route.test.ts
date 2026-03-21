import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  constructEvent,
  retrieveSubscription,
  prismaSubscriptionUpsert,
  prismaSubscriptionUpdateMany,
  prismaUsageUpsert,
  headersMock,
} = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  retrieveSubscription: vi.fn(),
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
    subscription: {
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
    prismaSubscriptionUpsert.mockResolvedValue(undefined);
    prismaSubscriptionUpdateMany.mockResolvedValue(undefined);
    prismaUsageUpsert.mockResolvedValue(undefined);
  });

  it("persists completed checkout sessions with EUR creator pricing", async () => {
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
    expect(constructEvent).toHaveBeenCalledWith("payload", "sig_test", "whsec_test");
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
        update: { videosLimit: 10 },
        create: expect.objectContaining({
          userId: "user_123",
          videosGenerated: 0,
          videosLimit: 10,
        }),
      })
    );
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
    expect(prismaSubscriptionUpsert).not.toHaveBeenCalled();
    expect(prismaSubscriptionUpdateMany).not.toHaveBeenCalled();
  });
});
