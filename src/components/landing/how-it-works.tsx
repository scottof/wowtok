"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Choose your theme & prompt",
    description:
      "Select a theme like horror, fantasy, or comedy. Then describe what your video should be about.",
  },
  {
    step: "02",
    title: "Add narration text",
    description:
      "Write the narrator's script or let AI generate one. Pick from premium AI voices to bring it to life.",
  },
  {
    step: "03",
    title: "Generate & download",
    description:
      "Hit generate and watch AI create your video with scenes, animations, voiceover, and captions. Download and post!",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/30 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps to your next viral video
          </h2>
          <p className="mt-4 text-muted-foreground">
            No video editing skills needed. Just describe it and let AI do the rest.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <div className="mb-4">
                <span className="gradient-text text-5xl font-bold">
                  {step.step}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
