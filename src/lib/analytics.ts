type EventParams = Record<string, string | number | boolean | undefined>;

/**
 * Fire a GA4 custom event.
 * Safe to call during SSR or when gtag is blocked — silently no-ops.
 */
export function trackEvent(name: string, params?: EventParams) {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
    .gtag;
  if (!gtag) return;
  gtag("event", name, params);
}
