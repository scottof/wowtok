import { beforeEach, describe, expect, it, vi } from "vitest";
import { assertSameOrigin, consumeRateLimit, getRequestIp } from "./request";

describe("request security helpers", () => {
  beforeEach(() => {
    vi.useRealTimers();
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  it("extracts the first forwarded IP", () => {
    const request = new Request("https://example.com", {
      headers: {
        "x-forwarded-for": "1.2.3.4, 5.6.7.8",
      },
    });

    expect(getRequestIp(request)).toBe("1.2.3.4");
  });

  it("allows the first request inside a rate-limit window and blocks overflow", () => {
    const key = `test-${Date.now()}`;

    expect(consumeRateLimit(key, { limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(consumeRateLimit(key, { limit: 2, windowMs: 60_000 }).allowed).toBe(true);
    expect(consumeRateLimit(key, { limit: 2, windowMs: 60_000 }).allowed).toBe(false);
  });

  it("accepts same-origin requests and rejects cross-origin ones when app URL is set", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://www.wowtok.com";

    const sameOrigin = new Request("https://www.wowtok.com/api/contact", {
      headers: { origin: "https://www.wowtok.com" },
    });
    const crossOrigin = new Request("https://www.wowtok.com/api/contact", {
      headers: { origin: "https://evil.example" },
    });

    expect(assertSameOrigin(sameOrigin)).toBe(true);
    expect(assertSameOrigin(crossOrigin)).toBe(false);
  });
});
