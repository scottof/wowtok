"use client";

import {
  Wand2,
  Mic,
  Palette,
  Zap,
  Download,
  Layers,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Wand2,
    title: "AI Script Generation",
    description:
      "Describe your idea and AI writes a compelling script with scene breakdowns automatically.",
  },
  {
    icon: Palette,
    title: "10+ Themed Styles",
    description:
      "Horror, fantasy, sci-fi, comedy and more. Each theme comes with curated visual styles.",
  },
  {
    icon: Mic,
    title: "Premium AI Voices",
    description:
      "Choose from realistic AI narrators powered by ElevenLabs. Multiple voices and tones.",
  },
  {
    icon: Zap,
    title: "Full AI Video",
    description:
      "Not just slideshows — real AI-generated video clips animated from your scenes.",
  },
  {
    icon: Layers,
    title: "Auto Captions",
    description:
      "TikTok-style captions are automatically synced with your narration for maximum engagement.",
  },
  {
    icon: Download,
    title: "Ready to Post",
    description:
      "Download in 9:16 vertical format, optimized for TikTok, Reels, and YouTube Shorts.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to go viral
          </h2>
          <p className="mt-4 text-muted-foreground">
            A complete AI video pipeline, from idea to TikTok-ready content.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="group rounded-2xl border border-border/60 bg-card p-6 transition-all hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-colors group-hover:bg-violet-100">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
