DO $$ BEGIN
  CREATE TYPE "BillingSource" AS ENUM ('SUBSCRIPTION', 'CREDIT_PURCHASE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CreditPurchaseStatus" AS ENUM ('COMPLETED', 'EXHAUSTED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "Currency" AS ENUM ('USD', 'EUR');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Video"
  ADD COLUMN IF NOT EXISTS "billingSource" "BillingSource" NOT NULL DEFAULT 'SUBSCRIPTION',
  ADD COLUMN IF NOT EXISTS "creditsCharged" INTEGER,
  ADD COLUMN IF NOT EXISTS "creditRestoredAt" TIMESTAMP(3);

ALTER TABLE "UsageRecord"
  ADD COLUMN IF NOT EXISTS "creditsUsed" INTEGER,
  ADD COLUMN IF NOT EXISTS "creditsLimit" INTEGER;

UPDATE "UsageRecord"
SET
  "creditsUsed" = COALESCE("creditsUsed", COALESCE("videosGenerated", 0) * 10),
  "creditsLimit" = COALESCE("creditsLimit", COALESCE("videosLimit", 0) * 10);

ALTER TABLE "UsageRecord"
  ALTER COLUMN "creditsUsed" SET DEFAULT 0,
  ALTER COLUMN "creditsUsed" SET NOT NULL,
  ALTER COLUMN "creditsLimit" SET NOT NULL;

CREATE TABLE IF NOT EXISTS "CreditPurchase" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "stripeCheckoutSessionId" TEXT NOT NULL,
  "stripePaymentIntentId" TEXT,
  "creditsPurchased" INTEGER NOT NULL,
  "creditsRemaining" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" "Currency" NOT NULL,
  "status" "CreditPurchaseStatus" NOT NULL DEFAULT 'COMPLETED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditPurchase_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CreditPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CreditPurchase_stripeCheckoutSessionId_key" ON "CreditPurchase"("stripeCheckoutSessionId");
CREATE UNIQUE INDEX IF NOT EXISTS "CreditPurchase_stripePaymentIntentId_key" ON "CreditPurchase"("stripePaymentIntentId");
CREATE INDEX IF NOT EXISTS "CreditPurchase_userId_createdAt_idx" ON "CreditPurchase"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "CreditUsage" (
  "id" TEXT NOT NULL,
  "creditPurchaseId" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  "creditsConsumed" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CreditUsage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CreditUsage_creditPurchaseId_fkey" FOREIGN KEY ("creditPurchaseId") REFERENCES "CreditPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CreditUsage_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CreditUsage_creditPurchaseId_idx" ON "CreditUsage"("creditPurchaseId");
CREATE INDEX IF NOT EXISTS "CreditUsage_videoId_idx" ON "CreditUsage"("videoId");
