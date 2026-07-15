"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

/**
 * Bottom sheet accesible: se apoya en Radix Dialog (focus trap, Escape, aria)
 * y anima con Framer Motion. Full-height en mobile, centrado tipo modal en
 * pantallas grandes.
 */
export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-cocoa-deep/45 backdrop-blur-[2px]"
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              onOpenAutoFocus={(e) => e.preventDefault()}
              aria-describedby={description ? undefined : undefined}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 32, stiffness: 340 }}
                className={cn(
                  "fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-[1.75rem] border-t border-border bg-surface shadow-[var(--shadow-lift)]",
                  "sm:inset-x-auto sm:left-1/2 sm:bottom-auto sm:top-1/2 sm:max-h-[88vh] sm:w-[min(30rem,92vw)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[1.75rem] sm:border",
                  className,
                )}
              >
                {/* grip handle (mobile) */}
                <div className="flex justify-center pt-3 sm:hidden">
                  <span className="h-1.5 w-10 rounded-full bg-cream-3" />
                </div>

                {(title || description) && (
                  <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-3">
                    <div className="min-w-0">
                      {title && (
                        <Dialog.Title className="font-display text-xl font-semibold text-cocoa">
                          {title}
                        </Dialog.Title>
                      )}
                      {description && (
                        <Dialog.Description className="mt-0.5 text-sm text-muted">
                          {description}
                        </Dialog.Description>
                      )}
                    </div>
                    <Dialog.Close
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-cocoa-soft transition-colors hover:bg-cream-2"
                      aria-label="Cerrar"
                    >
                      <X className="h-5 w-5" />
                    </Dialog.Close>
                  </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
                  {children}
                </div>

                {footer && (
                  <div className="border-t border-border bg-surface/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
                    {footer}
                  </div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
