"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  LogOut,
  Link2,
  Loader2,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  User,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/supabase/auth-provider";
import { signOut } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

interface VideoMetadata {
  video_id: string;
  title: string;
  thumbnail_url: string;
  channel_name: string;
  youtube_url: string;
}

interface ClipRequest {
  id: string;
  video_url: string;
  video_title: string | null;
  thumbnail_url: string | null;
  channel_name: string | null;
  status: string;
  created_at: string;
}

function isValidYouTubeUrl(url: string): boolean {
  const regex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)[\w-]{11}(&[\w=-]*)?$/;
  return regex.test(url);
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [clips, setClips] = useState<ClipRequest[]>([]);
  const [freeClipsRemaining, setFreeClipsRemaining] = useState(15);
  const [clipsLimit, setClipsLimit] = useState(15);
  const [clipsUsed, setClipsUsed] = useState(0);
  const [plan, setPlan] = useState("free");
  const [loadingClips, setLoadingClips] = useState(true);
  const [preview, setPreview] = useState<VideoMetadata | null>(null);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState(false);

  const fetchClips = useCallback(async () => {
    try {
      const res = await fetch("/api/clips");
      if (res.ok) {
        const data = await res.json();
        setClips(data.clips ?? []);
        setFreeClipsRemaining(data.free_clips_remaining ?? 15);
        setClipsLimit(data.clips_limit ?? 15);
        setClipsUsed(data.clips_used ?? 0);
        setPlan(data.plan ?? "free");
      }
    } catch {
      // silent
    } finally {
      setLoadingClips(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      fetchClips();
    }
  }, [user, fetchClips]);

  useEffect(() => {
    if (!url.trim() || !isValidYouTubeUrl(url)) {
      setPreview(null);
      setMetadataError(false);
      return;
    }

    const debounce = setTimeout(async () => {
      setFetchingMetadata(true);
      setMetadataError(false);
      try {
        const res = await fetch("/api/youtube-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        if (res.ok) {
          const data = await res.json();
          setPreview(data);
        } else {
          setPreview(null);
          setMetadataError(true);
        }
      } catch {
        setPreview(null);
        setMetadataError(true);
      } finally {
        setFetchingMetadata(false);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [url]);

  async function handleGenerate() {
    if (!url.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      toast.error("Please enter a valid YouTube URL");
      return;
    }

    if (freeClipsRemaining <= 0) {
      toast.error("No free clips remaining. Upgrade to Pro!");
      return;
    }

    setGenerating(true);

    try {
      const res = await fetch("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: url,
          video_title: preview?.title ?? null,
          thumbnail_url: preview?.thumbnail_url ?? null,
          channel_name: preview?.channel_name ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to generate clip");
        return;
      }

      setFreeClipsRemaining(data.free_clips_remaining);
      setClipsUsed(clipsLimit - data.free_clips_remaining);
      setClips((prev) => [data.clip_request, ...prev]);
      setUrl("");
      setPreview(null);
      toast.success("Clip generation started!");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setGenerating(false);
    }
  }

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const clipsPercent = clipsLimit > 0 ? (clipsUsed / clipsLimit) * 100 : 0;
  const noCredits = freeClipsRemaining <= 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
              <Play className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              ClipMaker<span className="text-primary">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/billing"
              className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground sm:inline-flex"
            >
              <CreditCard className="h-4 w-4" />
              Billing
            </Link>
            <span className="hidden text-sm text-muted-foreground md:inline">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Generate viral clips from YouTube videos with AI
          </p>
        </motion.div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Free Clips Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="ring-1 ring-white/[0.06] bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  Free Clips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {freeClipsRemaining}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    / {clipsLimit} remaining
                  </span>
                </div>
                <Progress value={clipsPercent} className="mt-3" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {clipsUsed} clips used
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Clips Generated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <Card className="ring-1 ring-white/[0.06] bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  Clips Generated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{clips.length}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Total clips created
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="ring-1 ring-white/[0.06] bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-purple-400" />
                  Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium truncate">{user.email}</div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      plan === "pro"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : plan === "enterprise"
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {plan === "pro" && <Zap className="h-3 w-3" />}
                    {plan === "enterprise" && <Sparkles className="h-3 w-3" />}
                    {plan === "free" && <Sparkles className="h-3 w-3" />}
                    {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
                  </span>
                </div>
                <Link
                  href="/billing"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300"
                >
                  <CreditCard className="h-3 w-3" />
                  Manage billing
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Generate Clips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8"
        >
          <Card className="ring-1 ring-white/[0.06] bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-blue-400" />
                Generate Clips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <svg
                    className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <input
                    type="url"
                    placeholder="Paste your YouTube video URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !generating && preview && handleGenerate()}
                    disabled={generating || noCredits}
                    className="flex h-12 w-full rounded-lg border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={generating || noCredits || !url.trim() || !preview}
                  className="flex h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : noCredits ? (
                    "No Credits Left"
                  ) : (
                    <>
                      Generate Clip
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              {url.trim() && !isValidYouTubeUrl(url) && !generating && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Please enter a valid YouTube URL
                </p>
              )}

              {/* Video Preview Card */}
              {fetchingMetadata && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                  <span className="text-sm text-muted-foreground">Fetching video info...</span>
                </div>
              )}

              {preview && !fetchingMetadata && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative shrink-0 sm:w-64">
                      <img
                        src={preview.thumbnail_url}
                        alt={preview.title}
                        className="h-40 w-full object-cover sm:h-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/90 shadow-lg">
                          <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col justify-center gap-2 p-4">
                      <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                        {preview.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>{preview.channel_name}</span>
                      </div>
                      <a
                        href={preview.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Watch on YouTube
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}

              {metadataError && !fetchingMetadata && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-yellow-400">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Could not fetch video info. You can still generate clips.
                </p>
              )}

              {noCredits && (
                <div className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                  <p className="text-sm font-medium text-yellow-300">
                    You&apos;ve used all your free clips!
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upgrade to Pro for unlimited clips and premium features.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing Section (shown when no credits) */}
        {noCredits && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <Card className="ring-1 ring-white/[0.06] bg-white/[0.02]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Upgrade Your Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-blue-500/20 bg-gradient-to-b from-blue-500/10 to-purple-500/5 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-xs font-semibold text-white">
                        <Zap className="h-3 w-3" />
                        Most Popular
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">Pro</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">$29</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {[
                        "Unlimited clips",
                        "Faster processing",
                        "4K export quality",
                        "Custom captions & branding",
                      ].map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 shrink-0 text-blue-400" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/billing"
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-opacity hover:opacity-90"
                    >
                      Start Pro Trial
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
                    <h3 className="text-lg font-semibold">Enterprise</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">Custom</span>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {[
                        "Team access",
                        "API access",
                        "Custom integrations",
                        "Dedicated support",
                      ].map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 shrink-0 text-blue-400" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/contact"
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06]"
                    >
                      Contact Sales
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Clip History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-8"
        >
          <Card className="ring-1 ring-white/[0.06] bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-400" />
                Clip History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingClips ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : clips.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05]">
                    <Link2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    No clips generated yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Paste a YouTube URL above to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clips.map((clip) => (
                    <div
                      key={clip.id}
                      className="flex flex-col gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3 overflow-hidden min-w-0">
                        {clip.thumbnail_url ? (
                          <img
                            src={clip.thumbnail_url}
                            alt={clip.video_title ?? "Video"}
                            className="h-10 w-16 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                            <svg
                              className="h-5 w-5 text-red-500"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                          </div>
                        )}
                        <div className="min-w-0">
                          <a
                            href={clip.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-blue-400 truncate"
                          >
                            <span className="truncate">{clip.video_title ?? clip.video_url}</span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                          </a>
                          {clip.channel_name && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {clip.channel_name}
                            </p>
                          )}
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(clip.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          clip.status === "Completed"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        {clip.status === "Completed" ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        {clip.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
