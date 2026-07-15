"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { ProductImage } from "@/components/shared/product-image";
import { LogoMark } from "@/components/shared/logo";
import { InstagramIcon } from "@/components/shared/icons";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* fondo cálido */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-cream-2 via-cream to-cream" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-caramel-soft/25 blur-3xl" />
        <div className="absolute -right-16 top-40 h-80 w-80 rounded-full bg-caramel/10 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-16">
        {/* Texto */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-xs font-medium text-cocoa-soft backdrop-blur"
          >
            <span className="flex text-caramel">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </span>
            +1.300 clientes felices en Instagram
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-cocoa text-balance sm:text-5xl lg:text-6xl"
          >
            Postres artesanales,{" "}
            <span className="relative whitespace-nowrap text-caramel-deep">
              hechos con amor
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
            className="mt-5 max-w-md text-base leading-relaxed text-cocoa-soft sm:text-lg"
          >
            De nuestra cocina a tu mesa. Elegí tus favoritos y pedí en menos de
            un minuto: pagás con Mercado Pago, transferencia o efectivo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/catalogo"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-caramel px-7 text-sm font-semibold text-primary-foreground shadow-[0_12px_30px_-8px_rgba(197,123,44,0.8)] transition-all hover:bg-caramel-deep active:scale-95"
            >
              Comprar ahora <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/catalogo"
              className="inline-flex h-12 items-center rounded-full border border-cocoa/20 px-7 text-sm font-semibold text-cocoa transition-all hover:bg-cocoa hover:text-cream active:scale-95"
            >
              Ver catálogo
            </Link>
          </motion.div>

          {/* Emprendedor visible */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="mt-8 flex items-center gap-3"
          >
            <span className="relative h-11 w-11 overflow-hidden rounded-full border-2 border-surface shadow-sm">
              <ProductImage src={null} alt="Facundo, fundador" emoji="👨‍🍳" fill sizes="44px" />
            </span>
            <p className="text-sm text-cocoa-soft">
              <span className="font-semibold text-cocoa">Facundo</span>, cada
              postre lo prepara él mismo
              <a
                href="https://instagram.com/elgustodemipueblo2023"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex items-center gap-1 text-caramel-deep hover:underline"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
              </a>
            </p>
          </motion.div>
        </div>

        {/* Collage de imágenes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[1.6rem] shadow-[var(--shadow-lift)]">
              <ProductImage
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80"
                alt="Torta de chocolate"
                emoji="🎂"
                fill
                priority
                sizes="(max-width:1024px) 45vw, 260px"
              />
            </div>
            <div className="mt-8 space-y-3">
              <div className="relative aspect-square overflow-hidden rounded-[1.6rem] shadow-[var(--shadow-lift)]">
                <ProductImage
                  src="https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80"
                  alt="Postre en vaso"
                  emoji="🍮"
                  fill
                  sizes="(max-width:1024px) 45vw, 260px"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] shadow-[var(--shadow-lift)]">
                <ProductImage
                  src="https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80"
                  alt="Cheesecake de frutos rojos"
                  emoji="🍰"
                  fill
                  sizes="(max-width:1024px) 45vw, 260px"
                />
              </div>
            </div>
          </div>

          {/* tarjeta flotante */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -bottom-4 left-4 flex items-center gap-2.5 rounded-2xl border border-border bg-surface/95 px-4 py-2.5 shadow-[var(--shadow-lift)] backdrop-blur"
          >
            <LogoMark className="h-8 w-8" />
            <div className="leading-tight">
              <p className="text-xs font-semibold text-cocoa">Entrega el mismo día</p>
              <p className="text-[0.7rem] text-muted">en Benito Juárez y alrededores</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
