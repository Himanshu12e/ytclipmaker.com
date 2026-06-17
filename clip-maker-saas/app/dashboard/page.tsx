"use client";

import { useAuth } from "@/lib/supabase/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/landing/navbar";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center pt-16">
        <div className="w-full max-w-4xl px-4">
          <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
          <p className="mb-8 text-muted-foreground">
            Welcome back, {user.email}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-2 text-lg font-semibold">Account</h2>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-2 text-lg font-semibold">Subscription</h2>
              <p className="text-sm text-muted-foreground">
                Free Plan
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
