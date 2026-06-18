"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  LogOut,
  Check,
  Zap,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Building2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/supabase/auth-provider";
import { signOut } from "@/lib/store";
import { plans, getPlanById } from "@/lib/pricing";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Profile {
  plan: string;
  clips_limit: number;
  free_clips_remaining: number;
  created_at: string;
}

function BillingContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgradeParam = searchParams.get("upgrade");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/profile");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (upgradeParam === "pro") {
      const el = document.getElementById("plans");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [upgradeParam]);

  async function handleUpgrade(planId: string) {
    if (planId === currentPlanId) {
      toast.error("You're already on this plan");
      return;
    }

    setUpgrading(planId);
    try {
      const res = await fetch("/api/plan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Failed to update plan");
        return;
      }

      setProfile(data.profile);
      toast.success(
        `Switched to ${getPlanById(planId)?.name} plan!`
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setUpgrading(null);
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

  const currentPlanId = profile?.plan ?? "free";
  const currentPlan = getPlanById(currentPlanId);
  const clipsLimit = profile?.clips_limit ?? 15;
  const freeClipsRemaining = profile?.free_clips_remaining ?? 0;
  const clipsUsed = clipsLimit - freeClipsRemaining;

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
              href="/dashboard"
              className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground sm:inline-flex"
            >
              Dashboard
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
            Billing & Plans
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your subscription and billing details
          </p>
        </motion.div>

        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8"
        >
          <Card className="ring-1 ring-white/[0.06] bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-400" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingProfile ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-3 py-1 text-sm font-semibold text-white">
                        {currentPlanId === "pro" && <Zap className="h-3 w-3" />}
                        {currentPlanId === "enterprise" && (
                          <Building2 className="h-3 w-3" />
                        )}
                        {currentPlan?.name ?? "Free"}
                      </span>
                      {currentPlanId === "pro" && (
                        <span className="text-sm text-muted-foreground">
                          $29/month
                        </span>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Clips Remaining
                        </p>
                        <p className="text-2xl font-bold">
                          {currentPlanId === "pro" || currentPlanId === "enterprise"
                            ? "Unlimited"
                            : freeClipsRemaining}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Clips Used
                        </p>
                        <p className="text-2xl font-bold">{clipsUsed}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Clips Limit
                        </p>
                        <p className="text-2xl font-bold">
                          {clipsLimit === 999999
                            ? "Unlimited"
                            : clipsLimit}
                        </p>
                      </div>
                    </div>
                    {currentPlanId === "free" && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span>
                          You&apos;re on the Free plan.{" "}
                          <Link
                            href="#plans"
                            className="text-blue-400 hover:text-blue-300 underline underline-offset-2"
                          >
                            Upgrade for more features
                          </Link>
                        </span>
                      </div>
                    )}
                    {currentPlanId === "pro" && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <span>You have full access to all Pro features.</span>
                      </div>
                    )}
                    {currentPlanId === "enterprise" && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4 text-purple-400" />
                        <span>
                          Enterprise plan with custom features and support.
                        </span>
                      </div>
                    )}
                  </div>

                  {currentPlanId === "free" && (
                    <button
                      onClick={() => handleUpgrade("pro")}
                      disabled={upgrading === "pro"}
                      className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {upgrading === "pro" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Upgrade to Pro
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                  {currentPlanId === "pro" && (
                    <button
                      onClick={() => handleUpgrade("enterprise")}
                      disabled={upgrading === "enterprise"}
                      className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.06] disabled:opacity-50"
                    >
                      {upgrading === "enterprise" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Building2 className="h-4 w-4" />
                          Upgrade to Enterprise
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Plan Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12"
          id="plans"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Choose Your Plan
            </h2>
            <p className="mt-2 text-muted-foreground">
              Select the plan that best fits your needs
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const isCurrentPlan = plan.id === currentPlanId;
              const planIcon =
                plan.id === "free" ? (
                  <Sparkles className="h-5 w-5 text-blue-400" />
                ) : plan.id === "pro" ? (
                  <Zap className="h-5 w-5 text-yellow-400" />
                ) : (
                  <Building2 className="h-5 w-5 text-purple-400" />
                );

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className={`relative rounded-2xl ${
                    plan.popular
                      ? "bg-gradient-to-b from-blue-500/50 to-purple-500/50 p-px lg:scale-105 lg:z-10"
                      : "bg-white/[0.06] p-px"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25">
                        <Zap className="h-3 w-3" />
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-6 sm:p-8 ${
                      plan.popular ? "bg-card" : "bg-card/80"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {planIcon}
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      {isCurrentPlan && (
                        <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-sm text-muted-foreground">
                          {plan.period}
                        </span>
                      )}
                    </div>

                    {isCurrentPlan ? (
                      <button
                        disabled
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-muted-foreground cursor-not-allowed"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Current Plan
                      </button>
                    ) : plan.id === "enterprise" ? (
                      <button
                        onClick={() => handleUpgrade("enterprise")}
                        disabled={!!upgrading}
                        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                            : "border border-white/[0.08] bg-white/[0.03] text-foreground hover:bg-white/[0.06]"
                        }`}
                      >
                        {upgrading === "enterprise" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            {plan.cta}
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={!!upgrading}
                        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 ${
                          plan.popular
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                            : "border border-white/[0.08] bg-white/[0.03] text-foreground hover:bg-white/[0.06]"
                        }`}
                      >
                        {upgrading === plan.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            {plan.cta}
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}

                    <ul className="mt-8 space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature.text}
                          className="flex items-start gap-3 text-sm"
                        >
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              feature.included
                                ? "text-blue-400"
                                : "text-muted-foreground/40"
                            }`}
                          />
                          <span
                            className={
                              feature.included
                                ? "text-muted-foreground"
                                : "text-muted-foreground/50"
                            }
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          <Card className="ring-1 ring-white/[0.06] bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-purple-400" />
                Billing FAQ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  {
                    q: "When will billing be available?",
                    a: "We're currently in early access. Billing will be enabled soon. You can upgrade your plan now and we'll notify you when payments go live.",
                  },
                  {
                    q: "Can I change plans at any time?",
                    a: "Yes. You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
                  },
                  {
                    q: "Is there a free trial for Pro?",
                    a: "Yes! New Pro subscribers get a 7-day free trial. You won't be charged until the trial ends.",
                  },
                  {
                    q: "What payment methods do you accept?",
                    a: "We accept all major credit cards, debit cards, and will support PayPal and Apple Pay in the future.",
                  },
                ].map((item) => (
                  <div
                    key={item.q}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <h4 className="text-sm font-semibold text-foreground">
                      {item.q}
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 mb-12"
        >
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Need help choosing a plan?{" "}
              <Link
                href="/contact"
                className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
              >
                Contact our team
                <ExternalLink className="h-3 w-3" />
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
