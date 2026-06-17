"use client";

import Link from "next/link";
import { Play } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "API", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
    { label: "GDPR", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-12 sm:py-16 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Play className="h-4 w-4 fill-white text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                ClipMaker<span className="text-primary">AI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Turn long videos into viral short clips with AI. Create
              scroll-stopping content in seconds.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="mb-4 text-sm font-semibold">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ClipMaker AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Twitter", "GitHub", "Discord"].map((social) => (
              <Link
                key={social}
                href="#"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {social}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
