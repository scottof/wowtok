"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-violet-100/60 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pt-28">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
            <Play className="h-3 w-3 fill-violet-600 text-violet-600" />
            AI-powered TikTok video generation
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            From prompt to{" "}
            <span className="gradient-text">viral TikTok</span>{" "}
            in minutes
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Choose a theme, write your prompt, and let AI create a complete
            video with voiceover. Ready to post on TikTok in minutes, not hours.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="gradient-bg w-full border-0 text-white hover:opacity-90 sm:w-auto"
              asChild
            >
              <Link href="/signup">
                Start creating free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/#how-it-works">See how it works</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required &middot; 1 free video to try
          </p>
        </motion.div>

        {/* Video preview mockup */}
        <motion.div
          className="mx-auto mt-16 max-w-4xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative rounded-2xl border border-border/60 bg-muted/30 p-2 shadow-2xl shadow-violet-500/5">
            <div className="aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-lg">
                    <Play className="h-7 w-7 fill-violet-600 text-violet-600" />
                  </div>
                  <p className="text-sm font-medium text-violet-900/60">
                    See Promptok in action
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
