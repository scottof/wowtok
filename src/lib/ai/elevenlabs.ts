import { env } from "@/lib/env";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

// Default voice IDs from ElevenLabs
const voiceMap: Record<string, string> = {
  adam: "pNInz6obpgDQGcFmaJgB",     // Adam
  bella: "EXAVITQu4vr4xnSDxMaL",    // Bella
  charlie: "IKne3meq5aSn9XLyUdCD",   // Charlie
  sarah: "EXAVITQu4vr4xnSDxMaL",    // Sarah
  james: "VR6AewLTigWG4xSOukaG",    // James
  emily: "LcfcDJNUP1GQjkzn1xUU",    // Emily
};

export async function generateVoiceover(
  text: string,
  voiceId: string = "adam"
): Promise<Buffer> {
  const elevenLabsVoiceId = voiceMap[voiceId] || voiceMap.adam;

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${elevenLabsVoiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

interface Alignment {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

interface VoiceoverWithTimestamps {
  audioBuffer: Buffer;
  srt: string;
}

/**
 * Generate voiceover with character-level timestamps.
 * Uses the /with-timestamps endpoint to get timing data for SRT generation.
 */
export async function generateVoiceoverWithTimestamps(
  text: string,
  voiceId: string = "adam"
): Promise<VoiceoverWithTimestamps> {
  const elevenLabsVoiceId = voiceMap[voiceId] || voiceMap.adam;

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${elevenLabsVoiceId}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const audioBuffer = Buffer.from(data.audio_base64, "base64");
  const alignment: Alignment = data.alignment;

  const srt = alignmentToSrt(alignment);

  return { audioBuffer, srt };
}

/**
 * Convert character-level alignment data to SRT subtitle format.
 * Groups characters into words based on spaces.
 */
function alignmentToSrt(alignment: Alignment): string {
  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;

  // Group characters into words
  interface Word {
    text: string;
    start: number;
    end: number;
  }

  const words: Word[] = [];
  let currentWord = "";
  let wordStart = -1;
  let wordEnd = 0;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const start = character_start_times_seconds[i];
    const end = character_end_times_seconds[i];

    if (char === " " || char === "\n") {
      if (currentWord.trim()) {
        words.push({ text: currentWord.trim(), start: wordStart, end: wordEnd });
      }
      currentWord = "";
      wordStart = -1;
    } else {
      if (wordStart === -1) wordStart = start;
      wordEnd = end;
      currentWord += char;
    }
  }
  // Push last word
  if (currentWord.trim()) {
    words.push({ text: currentWord.trim(), start: wordStart, end: wordEnd });
  }

  // Group words into subtitle segments (3-5 words per segment)
  const WORDS_PER_SEGMENT = 4;
  const segments: { text: string; start: number; end: number }[] = [];

  for (let i = 0; i < words.length; i += WORDS_PER_SEGMENT) {
    const chunk = words.slice(i, i + WORDS_PER_SEGMENT);
    segments.push({
      text: chunk.map((w) => w.text).join(" "),
      start: chunk[0].start,
      end: chunk[chunk.length - 1].end,
    });
  }

  // Format as SRT
  return segments
    .map((seg, i) => {
      const startTime = formatSrtTime(seg.start);
      const endTime = formatSrtTime(seg.end);
      return `${i + 1}\n${startTime} --> ${endTime}\n${seg.text}`;
    })
    .join("\n\n");
}

/**
 * Format seconds to SRT timestamp: HH:MM:SS,mmm
 */
function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}
