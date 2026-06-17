"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import DemoModal from "./demo-modal";

export default function DemoSection() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section id="demo" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Demo
          </span>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            See it in{" "}
            <span className="text-gradient">action</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Watch how ClipMaker AI transforms a long video into viral shorts in
            under 60 seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <div className="glass-card glow rounded-2xl p-1">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02]">
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center">
                  <button
                    onClick={() => setDemoOpen(true)}
                    className="group mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50"
                  >
                    <Play className="ml-1 h-8 w-8 fill-white text-white" />
                  </button>
                  <p className="text-lg font-semibold text-foreground">
                    Watch Demo
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    See how it works in 60 seconds
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              variant="outline"
              size="lg"
              className="group gap-2 px-8 text-base"
              onClick={() => setDemoOpen(true)}
            >
              <Play className="h-4 w-4 fill-current" />
              Watch Demo
            </Button>
          </div>
        </motion.div>
      </div>

      <DemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </section>
  );
}
