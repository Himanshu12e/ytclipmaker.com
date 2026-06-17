import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipMaker AI — Turn Long Videos into Viral Clips",
  description:
    "Automatically extract the most engaging moments from long-form videos and turn them into scroll-stopping short clips with AI-powered editing, captions, and effects.",
  keywords: [
    "video clipping",
    "AI video editor",
    "short clips",
    "content repurposing",
    "social media",
    "viral clips",
  ],
  openGraph: {
    title: "ClipMaker AI — Turn Long Videos into Viral Clips",
    description:
      "Automatically extract the most engaging moments from long-form videos and turn them into scroll-stopping short clips.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
