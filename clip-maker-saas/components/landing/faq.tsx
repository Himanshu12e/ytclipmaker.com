"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What types of videos can I upload?",
    answer:
      "You can upload any long-form video including podcasts, webinars, tutorials, interviews, livestreams, and more. We support MP4, MOV, AVI, MKV, and WebM formats. Videos can be up to 4 hours long on Pro and Business plans.",
  },
  {
    question: "How does the AI decide which moments to clip?",
    answer:
      "Our AI analyzes multiple factors including speech patterns, visual engagement, topic transitions, audience retention signals, and viral potential. It identifies the most compelling and shareable moments based on what performs well on social media platforms.",
  },
  {
    question: "Can I customize the clips after generation?",
    answer:
      "Absolutely. While AI handles the heavy lifting, you can adjust clip boundaries, add or remove captions, change caption styles, add your own branding, adjust audio levels, and more before exporting.",
  },
  {
    question: "What platforms can I export to?",
    answer:
      "We support direct export to TikTok, Instagram Reels, YouTube Shorts, X (Twitter), Facebook Reels, and LinkedIn. Each format is automatically optimized for the platform's aspect ratio, duration limits, and best practices.",
  },
  {
    question: "Is there a free plan available?",
    answer:
      "Yes! Our free plan includes 50 clips per month, videos up to 30 minutes, 720p export quality, and access to TikTok and Instagram exports. No credit card required to get started.",
  },
  {
    question: "How fast is the processing?",
    answer:
      "Most videos are processed in 2-5x real-time speed. A 1-hour video typically takes about 15-30 minutes to fully process, including AI analysis, clip generation, and caption creation.",
  },
  {
    question: "Can I use ClipMaker AI for my team or agency?",
    answer:
      "Yes! Our Business plan includes team collaboration features, shared workspaces, custom branding, API access, and dedicated support. Contact our sales team for custom enterprise solutions.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            FAQ
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked{" "}
            <span className="text-gradient">questions</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about ClipMaker AI
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-3xl">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between border-b border-white/[0.06] py-5 text-left transition-colors hover:text-foreground"
              >
                <span className="text-base font-medium">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
