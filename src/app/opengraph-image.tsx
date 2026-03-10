import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WowTok — AI TikTok Video Generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f0a1a 0%, #1a1030 40%, #2d1b4e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "white",
              fontWeight: 700,
            }}
          >
            P
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "white",
            }}
          >
            WowTok
          </span>
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "#c4b5fd",
            marginBottom: "16px",
            fontWeight: 600,
          }}
        >
          AI TikTok Video Generator
        </div>
        <div
          style={{
            fontSize: "18px",
            color: "#a78bfa",
            maxWidth: "600px",
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Write a prompt. Get a complete video with voiceover in minutes.
        </div>
      </div>
    ),
    { ...size }
  );
}
