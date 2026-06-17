"use client";

import { motion } from "framer-motion";
import {
  Brain,
  Subtitles,
  ScanFace,
  Crop,
  Share2,
  Film,
  MonitorPlay,
  Download,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Viral Moment Detection",
    description:
      "Our AI analyzes speech patterns, visual cues, and engagement signals to find the most viral-worthy moments in your videos.",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Subtitles,
    title: "Auto Captions",
    description:
      "Generate perfectly synced, beautifully styled captions automatically. Boost engagement and accessibility without lifting a finger.",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: ScanFace,
    title: "Face Tracking",
    description:
      "Advanced face detection keeps speakers centered and in frame throughout every clip, even from wide-angle footage.",
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400",
  },
  {
    icon: Crop,
    title: "Smart Reframing",
    description:
      "Automatically reframe landscape videos into vertical format while keeping the action perfectly centered.",
    color: "from-orange-500/20 to-red-500/20",
    iconColor: "text-orange-400",
  },
  {
    icon: Share2,
    title: "TikTok Export",
    description:
      "Export clips perfectly formatted for TikTok with optimal aspect ratio, duration, and hashtags ready to post.",
    color: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400",
  },
  {
    icon: Film,
    title: "Instagram Reels Export",
    description:
      "Create Reels-optimized clips with the right dimensions, length, and formatting for maximum Instagram reach.",
    color: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: MonitorPlay,
    title: "YouTube Shorts Export",
    description:
      "Generate YouTube Shorts-ready clips with vertical formatting and optimal length for the Shorts algorithm.",
    color: "from-red-500/20 to-orange-500/20",
    iconColor: "text-red-400",
  },
  {
    icon: Download,
    title: "One Click Download",
    description:
      "Download all your clips in one click. Batch export to your device or push directly to your social platforms.",
    color: "from-yellow-500/20 to-amber-500/20",
    iconColor: "text-yellow-400",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
            <span className="text-gradient">go viral</span>
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
          className="mx-auto mt-16 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass-card group relative rounded-xl p-6 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05]"
            >
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} ring-1 ring-white/[0.08] transition-all duration-300 group-hover:ring-white/[0.15]`}
              >
                <feature.icon className={`h-5 w-5 ${feature.iconColor}`} />
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
