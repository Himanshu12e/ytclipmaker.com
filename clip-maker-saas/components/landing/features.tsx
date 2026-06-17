"use client";

import { motion } from "framer-motion";
import { Brain, Scissors, Subtitles, Share2, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Detection",
    description:
      "Our AI analyzes your video to identify the most engaging, shareable moments based on speech patterns, visual cues, and viral potential.",
  },
  {
    icon: Scissors,
    title: "Smart Auto-Clipping",
    description:
      "Automatically split long videos into perfectly timed short clips — no manual scrubbing or guessing where to cut.",
  },
  {
    icon: Subtitles,
    title: "Auto Captions & Subtitles",
    description:
      "Generate accurate, beautifully styled captions in multiple languages. Boost accessibility and engagement with perfectly synced text.",
  },
  {
    icon: Share2,
    title: "One-Click Multi-Platform Export",
    description:
      "Export clips perfectly formatted for TikTok, Instagram Reels, YouTube Shorts, and X — all with a single click.",
  },
  {
    icon: Zap,
    title: "Lightning-Fast Processing",
    description:
      "Process hour-long videos in minutes. Our cloud infrastructure handles the heavy lifting so you can focus on creating.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Performance",
    description:
      "Track how your clips perform across platforms with built-in analytics. Understand what works and optimize your content strategy.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Features
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to{" "}
            <span className="text-gradient">repurpose content</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful AI tools that transform your long-form videos into
            platform-optimized short clips — automatically.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="glass-card group relative rounded-xl p-6 transition-all duration-300 hover:bg-white/[0.05]"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-white/[0.08]">
                <feature.icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
