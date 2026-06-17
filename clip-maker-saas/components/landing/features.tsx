"use client";

import { motion } from "framer-motion";
import { Brain, Scissors, Subtitles, Share2, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Detection",
    description:
      "Our AI analyzes your video to identify the most engaging, shareable moments based on speech patterns, visual cues, and viral potential.",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Scissors,
    title: "Smart Auto-Clipping",
    description:
      "Automatically split long videos into perfectly timed short clips — no manual scrubbing or guessing where to cut.",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: Subtitles,
    title: "Auto Captions & Subtitles",
    description:
      "Generate accurate, beautifully styled captions in multiple languages. Boost accessibility and engagement with perfectly synced text.",
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400",
  },
  {
    icon: Share2,
    title: "One-Click Export",
    description:
      "Export clips perfectly formatted for TikTok, Instagram Reels, YouTube Shorts, and X — all with a single click.",
    color: "from-orange-500/20 to-red-500/20",
    iconColor: "text-orange-400",
  },
  {
    icon: Zap,
    title: "Lightning-Fast Processing",
    description:
      "Process hour-long videos in minutes. Our cloud infrastructure handles the heavy lifting so you can focus on creating.",
    color: "from-yellow-500/20 to-amber-500/20",
    iconColor: "text-yellow-400",
  },
  {
    icon: BarChart3,
    title: "Analytics & Performance",
    description:
      "Track how your clips perform across platforms with built-in analytics. Understand what works and optimize your content strategy.",
    color: "from-indigo-500/20 to-violet-500/20",
    iconColor: "text-indigo-400",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
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
          className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass-card group relative rounded-xl p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className={`relative mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} ring-1 ring-white/[0.08] transition-all duration-300 group-hover:ring-white/[0.15]`}>
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
              </div>
              <h3 className="relative mb-2 text-base font-semibold">
                {feature.title}
              </h3>
              <p className="relative text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
