import type { BillingSource, Plan, SubStatus, VideoStatus } from "@prisma/client";

export type { BillingSource, Plan, SubStatus, VideoStatus };
export type SupportedCurrency = "USD" | "EUR";

export interface Scene {
  index: number;
  narration: string;
  visualDescription: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface VideoTheme {
  id: string;
  name: string;
  description: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  promptPrefix: string;
  style: string;
}

export interface PricingPlan {
  id: Plan;
  name: string;
  nameKey: string;
  description: string;
  descriptionKey: string;
  features: string[];
  featureKeys: string[];
  monthlyCredits: number;
  pricing: Record<
    SupportedCurrency,
    {
      price: number;
      originalPrice: number;
      stripePriceId: string;
    }
  >;
  highlighted?: boolean;
}

export interface VoiceOption {
  id: string;
  name: string;
  previewUrl?: string;
  tier: "standard" | "premium";
}

export interface UserWithSubscription {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  subscription: {
    plan: Plan;
    status: SubStatus;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
  } | null;
}

export interface VideoWithUser {
  id: string;
  title: string;
  theme: string;
  prompt: string;
  narratorText: string;
  status: VideoStatus;
  scenes: Scene[] | null;
  voiceId: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  errorMessage: string | null;
  createdAt: Date;
}

export interface UsageInfo {
  creditsUsed: number;
  creditsLimit: number;
  month: string;
}
