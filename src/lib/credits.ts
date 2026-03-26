import type { BillingSource, Plan, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUsageMonth } from "@/lib/dashboard/server";
import { getMonthlyCreditsLimit } from "@/lib/stripe/config";

type TxClient = Prisma.TransactionClient;

export async function getPurchasedCreditsAvailable(
  userId: string,
  tx: TxClient | typeof prisma = prisma
) {
  const result = await tx.creditPurchase.aggregate({
    where: {
      userId,
      creditsRemaining: { gt: 0 },
    },
    _sum: {
      creditsRemaining: true,
    },
  });

  return result._sum.creditsRemaining ?? 0;
}

export async function getOrCreateUsageRecord(
  tx: TxClient | typeof prisma,
  userId: string,
  plan: Plan,
  month = getCurrentUsageMonth()
) {
  return tx.usageRecord.upsert({
    where: { userId_month: { userId, month } },
    update: {
      creditsLimit: getMonthlyCreditsLimit(plan),
    },
    create: {
      userId,
      month,
      creditsUsed: 0,
      creditsLimit: getMonthlyCreditsLimit(plan),
    },
  });
}

export async function consumePurchasedCreditsForVideo(
  tx: TxClient,
  userId: string,
  videoId: string,
  requiredCredits: number
) {
  const purchases = await tx.creditPurchase.findMany({
    where: {
      userId,
      creditsRemaining: { gt: 0 },
    },
    orderBy: { createdAt: "asc" },
  });

  const totalAvailable = purchases.reduce(
    (sum, purchase) => sum + purchase.creditsRemaining,
    0
  );

  if (totalAvailable < requiredCredits) {
    throw new Error("INSUFFICIENT_PURCHASED_CREDITS");
  }

  let remainingToConsume = requiredCredits;

  for (const purchase of purchases) {
    if (remainingToConsume <= 0) break;

    const consumed = Math.min(purchase.creditsRemaining, remainingToConsume);
    const nextRemaining = purchase.creditsRemaining - consumed;

    await tx.creditPurchase.update({
      where: { id: purchase.id },
      data: {
        creditsRemaining: nextRemaining,
        status: nextRemaining === 0 ? "EXHAUSTED" : "COMPLETED",
      },
    });

    await tx.creditUsage.create({
      data: {
        creditPurchaseId: purchase.id,
        videoId,
        creditsConsumed: consumed,
      },
    });

    remainingToConsume -= consumed;
  }

  return "CREDIT_PURCHASE" as BillingSource;
}

export async function restorePurchasedCreditsForFailedVideo(
  tx: TxClient,
  videoId: string
) {
  const video = await tx.video.findUnique({
    where: { id: videoId },
    include: {
      creditUsages: true,
    },
  });

  if (
    !video ||
    video.billingSource !== "CREDIT_PURCHASE" ||
    video.creditRestoredAt ||
    video.creditUsages.length === 0
  ) {
    return false;
  }

  for (const usage of video.creditUsages) {
    await tx.creditPurchase.update({
      where: { id: usage.creditPurchaseId },
      data: {
        creditsRemaining: { increment: usage.creditsConsumed },
        status: "COMPLETED",
      },
    });
  }

  await tx.video.update({
    where: { id: videoId },
    data: {
      creditRestoredAt: new Date(),
    },
  });

  return true;
}
