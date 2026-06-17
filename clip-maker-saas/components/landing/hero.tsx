"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DemoModal from "./demo-modal";

export default function Hero() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-1.5 text-sm font-medium text-muted-foreground"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Now in Public Beta — Try Free
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Turn Long Videos into{" "}
            <span className="text-gradient">Viral Clips</span>{" "}
            in Seconds
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            ClipMaker AI automatically finds the most engaging moments from your
            long-form videos and transforms them into scroll-stopping short clips
            — complete with captions, transitions, and effects.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Button size="lg" className="group gap-2 px-8" asChild>
              <Link href="#pricing">
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="group gap-2 px-8"
              onClick={() => setDemoOpen(true)}
            >
              <Play className="h-4 w-4 fill-current" />
              Watch Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              50 clips/month free
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div className="glass-card glow rounded-2xl p-1">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-8 sm:p-12">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-4 text-xs text-muted-foreground">
                  clipmaker.ai/editor
                </span>
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="rounded-lg bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      AI Analysis
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full rounded-full bg-white/[0.06]" />
                    <div className="h-2 w-4/5 rounded-full bg-white/[0.06]" />
                    <div className="h-2 w-3/5 rounded-full bg-blue-500/30" />
                  </div>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Clip Generation
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="aspect-video rounded bg-white/[0.06]" />
                    <div className="aspect-video rounded bg-white/[0.06]" />
                    <div className="aspect-video rounded bg-purple-500/20" />
                    <div className="aspect-video rounded bg-white/[0.06]" />
                  </div>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-4 ring-1 ring-white/[0.06]">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Export & Publish
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 rounded bg-white/[0.06] px-2 py-1.5">
                      <div className="h-4 w-4 rounded bg-red-500/40" />
                      <div className="h-1.5 w-16 rounded-full bg-white/[0.08]" />
                    </div>
                    <div className="flex items-center gap-2 rounded bg-white/[0.06] px-2 py-1.5">
                      <div className="h-4 w-4 rounded bg-pink-500/40" />
                      <div className="h-1.5 w-12 rounded-full bg-white/[0.08]" />
                    </div>
                    <div className="flex items-center gap-2 rounded bg-white/[0.06] px-2 py-1.5">
                      <div className="h-4 w-4 rounded bg-blue-500/40" />
                      <div className="h-1.5 w-14 rounded-full bg-white/[0.08]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </section>
  );
}
