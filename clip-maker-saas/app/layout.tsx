import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/supabase/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClipMaker AI — Turn Long YouTube Videos Into Viral Shorts",
  description:
    "Paste a YouTube link and instantly generate viral clips for TikTok, Reels, and Shorts using AI. Turn long videos into viral shorts in seconds.",
  keywords: [
    "youtube to shorts",
    "AI video clipping",
    "viral clips",
    "tiktok clips",
    "instagram reels",
    "youtube shorts",
    "video repurposing",
    "AI video editor",
  ],
  openGraph: {
    title: "ClipMaker AI — Turn Long YouTube Videos Into Viral Shorts",
    description:
      "Paste a YouTube link and instantly generate viral clips for TikTok, Reels, and Shorts using AI.",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
        <body className="min-h-screen bg-background text-foreground antialiased">
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.14 0.005 270)",
              color: "oklch(0.985 0 0)",
              border: "1px solid rgba(255,255,255,0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
