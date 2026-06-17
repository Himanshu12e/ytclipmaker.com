"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";

const FREE_CLIPS_LIMIT = 15;

export default function Hero() {
  const [url, setUrl] = useState("");
  const router = useRouter();
  const { isLoggedIn, freeClipsRemaining, useClip } = useAuthStore();

  const handleGenerate = () => {
    if (!isLoggedIn) {
      router.push("/signup");
      return;
    }
    if (freeClipsRemaining <= 0) {
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (url.trim()) {
      useClip();
      router.push("/signup");
    }
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="bg-grid pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute top-1/3 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-blue-600/15 via-purple-600/10 to-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-purple-600/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-300"
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
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-7xl"
          >
            Turn Long YouTube Videos Into
            <br />
            <span className="text-gradient">Viral Shorts</span> In Seconds
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            Paste a YouTube link and instantly generate viral clips for TikTok,
            Reels, and Shorts using AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div className="glass-card glow rounded-2xl p-1">
              <div className="flex flex-col gap-3 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <input
                    type="url"
                    placeholder="Paste your YouTube video URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    className="h-12 w-full rounded-lg border-0 bg-transparent pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:text-base"
                  />
                </div>
                <Button
                  size="lg"
                  className="group h-12 gap-2 px-6 text-sm font-semibold sm:text-base"
                  onClick={handleGenerate}
                >
                  Generate 15 Free Clips
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              15 clips free
            </div>
          </motion.div>

          {isLoggedIn && freeClipsRemaining < FREE_CLIPS_LIMIT && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-sm text-muted-foreground"
            >
              {freeClipsRemaining} free clips remaining
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <div className="glass-card glow-strong rounded-2xl p-1">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 sm:p-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-4 text-xs text-muted-foreground font-mono">
                  clipmaker.ai/editor
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="rounded-lg bg-white/[0.03] p-4 ring-1 ring-white/[0.06]"
                >
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
                    <div className="h-2 w-2/5 rounded-full bg-blue-500/20" />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                  className="rounded-lg bg-white/[0.03] p-4 ring-1 ring-white/[0.06]"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500" />
                    <span className="text-xs font-medium text-muted-foreground">
                      Clip Generation
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="aspect-video rounded bg-gradient-to-br from-purple-500/20 to-blue-500/10" />
                    <div className="aspect-video rounded bg-white/[0.06]" />
                    <div className="aspect-video rounded bg-white/[0.06]" />
                    <div className="aspect-video rounded bg-gradient-to-br from-purple-500/15 to-blue-500/5" />
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.4 }}
                  className="rounded-lg bg-white/[0.03] p-4 ring-1 ring-white/[0.06]"
                >
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
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


