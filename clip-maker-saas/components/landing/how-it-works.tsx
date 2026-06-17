"use client";

import { motion } from "framer-motion";
import { Upload, Cpu, Download } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Your Video",
    description:
      "Drop your long-form video — podcast, webinar, tutorial, or livestream. We support all major formats up to 4 hours long.",
    color: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
    badgeColor: "from-blue-500 to-cyan-500",
  },
  {
    step: "02",
    icon: Cpu,
    title: "AI Does the Magic",
    description:
      "Our AI analyzes the entire video, identifies key moments, generates captions, and creates perfectly timed clips optimized for each platform.",
    color: "from-purple-500/20 to-pink-500/20",
    iconColor: "text-purple-400",
    badgeColor: "from-purple-500 to-pink-500",
  },
  {
    step: "03",
    icon: Download,
    title: "Export & Publish",
    description:
      "Review, customize, and export your clips in one click. Publish directly to TikTok, Instagram, YouTube Shorts, or download for later.",
    color: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400",
    badgeColor: "from-green-500 to-emerald-500",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            How It Works
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Three steps to{" "}
            <span className="text-gradient">viral content</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No editing skills required. Just upload, let AI work, and publish.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              <div className="relative mx-auto mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} ring-1 ring-white/[0.08]`}
                >
                  <step.icon className={`h-7 w-7 ${step.iconColor}`} />
                </motion.div>
                <div className={`absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${step.badgeColor} text-xs font-bold text-white shadow-lg`}>
                  {step.step}
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="pointer-events-none absolute top-8 left-[calc(50%+40px)] hidden h-px w-[calc(100%-80px)] bg-gradient-to-r from-white/[0.12] via-white/[0.06] to-transparent md:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
