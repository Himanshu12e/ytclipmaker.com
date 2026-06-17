"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Content Creator, 500K+ followers",
    avatar: "SC",
    content:
      "ClipMaker AI cut my editing time from 4 hours to 15 minutes. I just paste a YouTube link and get perfectly formatted clips for TikTok and Reels. It's been a game-changer for my content workflow.",
    stars: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Podcast Host, The Daily Drill",
    avatar: "MR",
    content:
      "I was skeptical about AI clipping, but the viral moment detection is scarily accurate. It finds the best soundbites I would have missed manually. My clips get 3x more engagement now.",
    stars: 5,
  },
  {
    name: "Emma Thompson",
    role: "Marketing Manager, TechFlow",
    avatar: "ET",
    content:
      "We repurpose our webinar recordings into dozens of social clips automatically. The auto captions and face tracking mean zero post-editing. Our social media presence has exploded.",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Testimonials
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Loved by{" "}
            <span className="text-gradient">creators worldwide</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our users have to say about ClipMaker AI
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card rounded-xl p-6 transition-all duration-300 hover:border-white/[0.12]"
            >
              <div className="mb-4 flex gap-1">
                {Array.from({ length: testimonial.stars }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-sm font-bold text-foreground ring-1 ring-white/[0.08]">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
