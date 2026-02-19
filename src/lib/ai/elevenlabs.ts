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
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
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
