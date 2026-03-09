import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the env module before importing the module under test
vi.mock("@/lib/env", () => ({
  env: {
    ELEVENLABS_API_KEY: "test-api-key",
  },
}));

import {
  generateVoiceover,
  generateVoiceoverWithTimestamps,
  alignmentToSrt,
} from "./elevenlabs";
import type { Alignment } from "./elevenlabs";

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

  it("calls the /with-timestamps endpoint for generateVoiceoverWithTimestamps", async () => {
    const mockAlignment: Alignment = {
      characters: ["H", "i"],
      character_start_times_seconds: [0.0, 0.1],
      character_end_times_seconds: [0.1, 0.2],
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          audio_base64: "dGVzdA==", // "test" in base64
          alignment: mockAlignment,
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateVoiceoverWithTimestamps("Hi", "adam");

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/with-timestamps");
    expect(result.audioBuffer).toBeInstanceOf(Buffer);
    expect(result.srt).toBeDefined();
    expect(typeof result.srt).toBe("string");
  });
});

describe("alignmentToSrt", () => {
  it("groups characters into words and generates valid SRT", () => {
    // Simulate "Hello world" alignment
    const alignment: Alignment = {
      characters: ["H", "e", "l", "l", "o", " ", "w", "o", "r", "l", "d"],
      character_start_times_seconds: [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5],
      character_end_times_seconds: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55],
    };

    const srt = alignmentToSrt(alignment);

    // Should have segment number, timestamps, and text
    expect(srt).toContain("1\n");
    expect(srt).toContain("00:00:00,000");
    expect(srt).toContain("Hello world");
    expect(srt).toContain("-->");
  });

  it("splits into multiple segments when text exceeds 4 words", () => {
    // Simulate "one two three four five six" (6 words -> 2 segments of 4 + 2)
    const chars = "one two three four five six".split("");
    const times = chars.map((_, i) => i * 0.05);
    const ends = chars.map((_, i) => (i + 1) * 0.05);

    const alignment: Alignment = {
      characters: chars,
      character_start_times_seconds: times,
      character_end_times_seconds: ends,
    };

    const srt = alignmentToSrt(alignment);
    const segments = srt.split("\n\n");

    expect(segments.length).toBe(2);
    expect(segments[0]).toContain("one two three four");
    expect(segments[1]).toContain("five six");
  });

  it("formats SRT timestamps correctly for times over 1 minute", () => {
    const alignment: Alignment = {
      characters: ["A"],
      character_start_times_seconds: [65.123],
      character_end_times_seconds: [66.456],
    };

    const srt = alignmentToSrt(alignment);

    // 65.123s = 00:01:05,123
    expect(srt).toContain("00:01:05,123");
    // 66.456s = 00:01:06,456
    expect(srt).toContain("00:01:06,456");
  });

  it("handles empty alignment gracefully", () => {
    const alignment: Alignment = {
      characters: [],
      character_start_times_seconds: [],
      character_end_times_seconds: [],
    };

    const srt = alignmentToSrt(alignment);
    expect(srt).toBe("");
  });
});
