"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Users, Star } from "lucide-react";

const badges = [
  { icon: Shield, label: "Bank-Level Security", color: "text-blue-400" },
  { icon: Zap, label: "99.9% Uptime", color: "text-yellow-400" },
  { icon: Users, label: "10,000+ Creators", color: "text-green-400" },
  { icon: Star, label: "4.9/5 Rating", color: "text-purple-400" },
];

export default function TrustBadges() {
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-8 sm:gap-12"
        >
          {badges.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex items-center gap-3 text-muted-foreground"
            >
              <badge.icon className={`h-5 w-5 ${badge.color}`} />
              <span className="text-sm font-medium">{badge.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
