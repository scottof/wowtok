// Centralized env validation — import this module on the server side
// to get typed, validated environment variables with clear error messages.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Lazy singletons — validated once on first access, cached thereafter.
function lazy<T>(fn: () => T): () => T {
  let cached: T | undefined;
  return () => (cached ??= fn());
}

export const env = {
  // Supabase
  get SUPABASE_SERVICE_ROLE_KEY() { return requireEnv("SUPABASE_SERVICE_ROLE_KEY"); },
  get NEXT_PUBLIC_SUPABASE_URL() { return requireEnv("NEXT_PUBLIC_SUPABASE_URL"); },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() { return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"); },

  // Database
  get DATABASE_URL() { return requireEnv("DATABASE_URL"); },
  get DIRECT_URL() { return requireEnv("DIRECT_URL"); },

  // Stripe
  get STRIPE_SECRET_KEY() { return requireEnv("STRIPE_SECRET_KEY"); },
  get STRIPE_WEBHOOK_SECRET() { return requireEnv("STRIPE_WEBHOOK_SECRET"); },
  get STRIPE_STARTER_PRICE_ID() { return requireEnv("STRIPE_STARTER_PRICE_ID"); },
  get STRIPE_CREATOR_PRICE_ID() { return requireEnv("STRIPE_CREATOR_PRICE_ID"); },
  get STRIPE_PRO_PRICE_ID() { return requireEnv("STRIPE_PRO_PRICE_ID"); },

  // AI providers
  get OPENAI_API_KEY() { return requireEnv("OPENAI_API_KEY"); },
  get ELEVENLABS_API_KEY() { return requireEnv("ELEVENLABS_API_KEY"); },
  get FAL_KEY() { return requireEnv("FAL_KEY"); },

  // Internal
  get PROCESS_SECRET() { return requireEnv("PROCESS_SECRET"); },

  // App
  get NEXT_PUBLIC_APP_URL() { return process.env.NEXT_PUBLIC_APP_URL || ""; },
};
