import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the env module before importing the module under test
vi.mock("@/lib/env", () => ({
  env: {
    ELEVENLABS_API_KEY: "test-api-key",
  },
}));

import { generateVoiceover } from "./elevenlabs";

describe("ai/elevenlabs", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function mockFetch() {
    const mockFn = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });
    vi.stubGlobal("fetch", mockFn);
    return mockFn;
  }

  it("uses the correct ElevenLabs voice ID for a known voice", async () => {
    const fetchMock = mockFetch();
    await generateVoiceover("Hello world", "charlie");

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    // Charlie's ElevenLabs voice ID
    expect(calledUrl).toContain("IKne3meq5aSn9XLyUdCD");
  });

  it("falls back to adam's voice ID for an unknown voice", async () => {
    const fetchMock = mockFetch();
    await generateVoiceover("Hello world", "unknown_voice");

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    // Adam's ElevenLabs voice ID (default fallback)
    expect(calledUrl).toContain("pNInz6obpgDQGcFmaJgB");
  });
});
