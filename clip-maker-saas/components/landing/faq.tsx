"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does ClipMaker AI work?",
    answer:
      "ClipMaker AI uses advanced artificial intelligence to analyze your YouTube videos. Simply paste a YouTube URL, and our AI will detect the most viral-worthy moments, generate short clips with auto captions, and format them for TikTok, Instagram Reels, and YouTube Shorts — all automatically.",
  },
  {
    question: "Do I need editing skills?",
    answer:
      "Not at all! ClipMaker AI handles everything for you. Our AI detects viral moments, adds captions, reframes for vertical format, and tracks faces — all with zero editing experience required. Just paste a link and let AI do the work.",
  },
  {
    question: "How many free clips do I get?",
    answer:
      "When you sign up, you receive 15 free clips with no credit card required. This gives you a chance to experience the full power of ClipMaker AI before committing to a paid plan.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes! You can cancel your subscription at any time. There are no long-term contracts or hidden fees. If you cancel, you'll retain access to your plan until the end of your current billing period.",
  },
  {
    question: "Which platforms are supported?",
    answer:
      "ClipMaker AI supports export to TikTok, Instagram Reels, YouTube Shorts, X (Twitter), Facebook Reels, and LinkedIn. Each clip is automatically optimized with the correct aspect ratio, duration, and formatting for each platform.",
  },
  {
    question: "How fast is the processing?",
    answer:
      "Most videos are processed in near real-time. A typical 30-minute YouTube video generates 15+ clips in under 2 minutes. Processing speed may vary based on video length and server load.",
  },
  {
    question: "What types of YouTube videos work best?",
    answer:
      "ClipMaker AI works great with podcasts, interviews, tutorials, lectures, vlogs, and any conversational content. The AI is trained to find engaging moments across all video types.",
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
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Frequently asked{" "}
            <span className="text-gradient">questions</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about ClipMaker AI
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-3xl">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className={`flex w-full items-center justify-between border-b border-white/[0.06] py-5 text-left transition-colors ${
                    isOpen
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-expanded={isOpen}
                >
                  <span className="pr-4 text-base font-medium">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
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
            );
          })}
        </div>
      </div>
    </section>
  );
}
