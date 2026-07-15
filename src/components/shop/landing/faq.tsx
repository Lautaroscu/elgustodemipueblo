"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";

const faqs = [
  {
    q: "¿Cómo hago un pedido?",
    a: "Elegí tus postres desde el catálogo, tocá “+” para sumarlos y finalizá el pedido. Completás tus datos y elegís cómo pagar. ¡Listo en menos de un minuto!",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Mercado Pago (tarjetas, dinero en cuenta), transferencia bancaria y efectivo al recibir o retirar tu pedido.",
  },
  {
    q: "¿Hacen envíos?",
    a: "Sí, hacemos envíos en Benito Juárez y alrededores. El costo depende de tu zona y lo ves antes de confirmar. También podés retirar coordinando por WhatsApp.",
  },
  {
    q: "¿Con cuánta anticipación tengo que pedir?",
    a: "Los postres individuales suelen estar disponibles el mismo día. Para tortas y encargos especiales, recomendamos pedir con 24 a 48 hs de anticipación.",
  },
  {
    q: "¿Puedo pedir sin algún ingrediente?",
    a: "¡Claro! Dejanos una nota en “Observaciones” al finalizar el pedido y hacemos lo posible por adaptarlo.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-20 sm:px-6">
      <Reveal>
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-caramel-deep">
            Ayuda
          </span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-cocoa sm:text-4xl">
            Preguntas frecuentes
          </h2>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <Accordion.Root type="single" collapsible className="mt-8 space-y-3">
          {faqs.map((f, i) => (
            <Accordion.Item
              key={i}
              value={`item-${i}`}
              className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-cocoa transition-colors hover:bg-cream-2">
                  {f.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-caramel-deep transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[accordion-up_0.2s_ease] data-[state=open]:animate-[accordion-down_0.2s_ease]">
                <p className="px-5 pb-4 text-sm leading-relaxed text-cocoa-soft">
                  {f.a}
                </p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Reveal>
    </section>
  );
}
