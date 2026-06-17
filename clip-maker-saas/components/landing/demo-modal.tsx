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
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <svg
                  className="ml-1 h-6 w-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                Demo video coming soon
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
