"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

import { AuthButton } from "@/components/shop/auth/auth-button";

const links = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/#historia", label: "Nuestra historia" },
  { href: "/#promos", label: "Promos" },
  { href: "/#faq", label: "Preguntas" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 12);
  });

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-surface/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 rounded-full transition-transform hover:scale-[1.02]"
        >
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-cocoa-soft transition-colors hover:bg-cream-2 hover:text-cocoa",
                pathname === l.href && "text-cocoa",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <AuthButton />
          <Link
            href="/catalogo"
            className="inline-flex h-10 items-center rounded-full bg-caramel px-5 text-sm font-medium text-primary-foreground shadow-[0_6px_20px_-8px_rgba(197,123,44,0.7)] transition-all hover:bg-caramel-deep active:scale-95"
          >
            Pedir ahora
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
