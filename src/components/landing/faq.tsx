"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqs = [
  {
    question: "What is Promptok?",
    answer:
      "Promptok is an AI-powered platform that generates complete TikTok-ready videos from simple text prompts. You choose a theme, write what you want, and AI creates a video with generated scenes, voiceover narration, and captions.",
  },
  {
    question: "How does the AI video generation work?",
    answer:
      "Our pipeline uses multiple AI models: GPT-4o breaks your script into scenes, FLUX generates visuals for each scene, Hailuo animates them into video clips, and ElevenLabs creates the voiceover. Everything is assembled into a final 9:16 vertical video.",
  },
  {
    question: "How long does it take to generate a video?",
    answer:
      "Most videos are generated in 3-5 minutes depending on length and complexity. You'll see real-time progress updates as each stage completes.",
  },
  {
    question: "What video format do I get?",
    answer:
      "Videos are generated in 9:16 vertical format (1080x1920) — optimized for TikTok, Instagram Reels, and YouTube Shorts. You get an MP4 file ready to upload directly.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel anytime from your dashboard. You'll keep access until the end of your billing period. No questions asked.",
  },
  {
    question: "Do I own the videos I create?",
    answer:
      "Yes, you have full commercial rights to all videos generated on Promptok. Use them on any platform for any purpose.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20">
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted-foreground">
            Everything you need to know about Promptok.
          </p>
        </motion.div>

        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
