import { NextResponse, after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { estimateCreditsForVideo } from "@/lib/stripe/config";
import { env } from "@/lib/env";
import {
  consumePurchasedCreditsForVideo,
  getOrCreateUsageRecord,
  getPurchasedCreditsAvailable,
} from "@/lib/credits";
import type { BillingSource, Plan } from "@prisma/client";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: { subscription: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, theme, prompt, narratorText, voiceId } = body;

    if (!title || !theme || !prompt || !narratorText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const requiredCredits = estimateCreditsForVideo(narratorText);
    const hasActiveSubscription =
      !!dbUser.subscription && dbUser.subscription.status === "ACTIVE";

    let videoId = "";

    try {
      const video = await prisma.$transaction(async (tx) => {
        let billingSource: BillingSource = "SUBSCRIPTION";
        let creditsFromSubscription = 0;
        let creditsFromPurchases = requiredCredits;

        if (hasActiveSubscription) {
          const usage = await getOrCreateUsageRecord(
            tx,
            dbUser.id,
            dbUser.subscription!.plan as Plan
          );

          const monthlyCreditsRemaining = Math.max(
            usage.creditsLimit - usage.creditsUsed,
            0
          );

          creditsFromSubscription = Math.min(
            monthlyCreditsRemaining,
            requiredCredits
          );
          creditsFromPurchases = requiredCredits - creditsFromSubscription;

          if (creditsFromSubscription > 0) {
            await tx.usageRecord.update({
              where: { userId_month: { userId: dbUser.id, month: usage.month } },
              data: { creditsUsed: { increment: creditsFromSubscription } },
            });
          }
        }

        const video = await tx.video.create({
          data: {
            userId: dbUser.id,
            title,
            theme,
            prompt,
            narratorText,
            voiceId: voiceId || "adam",
            status: "PENDING",
            billingSource,
            creditsCharged: requiredCredits,
          },
        });

        if (creditsFromPurchases > 0) {
          const purchasedCreditsAvailable = await getPurchasedCreditsAvailable(
            dbUser.id,
            tx
          );

          if (purchasedCreditsAvailable < creditsFromPurchases) {
            throw new Error("INSUFFICIENT_CREDITS");
          }

          await consumePurchasedCreditsForVideo(
            tx,
            dbUser.id,
            video.id,
            creditsFromPurchases
          );
          billingSource = "CREDIT_PURCHASE";

          await tx.video.update({
            where: { id: video.id },
            data: {
              billingSource,
            },
          });
        }

        return video;
      });

      videoId = video.id;
    } catch (error) {
      if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
        return NextResponse.json(
          { error: "Insufficient credits", code: "INSUFFICIENT_CREDITS" },
          { status: 402 }
        );
      }
      throw error;
    }

    // Trigger background pipeline (self-chaining step processor)
    const baseUrl = getBaseUrl();
    after(async () => {
      try {
        await fetch(`${baseUrl}/api/videos/process`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-process-secret": env.PROCESS_SECRET,
          },
          body: JSON.stringify({ videoId, step: "scenes" }),
        });
      } catch (e) {
        console.error("Failed to trigger pipeline:", e);
      }
    });

    return NextResponse.json({ videoId });
  } catch (error) {
    console.error("Generate video error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
