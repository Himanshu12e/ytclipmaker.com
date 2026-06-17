"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

interface DemoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DemoModal({ open, onOpenChange }: DemoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-white/[0.08] bg-background/95 p-0 backdrop-blur-xl sm:max-w-3xl">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                <svg
                  className="ml-1 h-6 w-6 text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground">
                Demo video coming soon
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                We&apos;re putting the finishing touches on it.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
