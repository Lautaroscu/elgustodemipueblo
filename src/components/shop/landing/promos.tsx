import Link from "next/link";
import { Clock, Gift, Percent } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { prisma } from "@/lib/db";

const iconFor: Record<string, typeof Clock> = {
  HAPPY_HOUR: Clock,
  TRES_POR_DOS: Gift,
  DOS_POR_UNO: Gift,
  PORCENTAJE: Percent,
  COMBO: Gift,
};

export async function Promos() {
  const now = new Date();
  const promos = await prisma.promotion.findMany({
    where: {
      activo: true,
      AND: [
        { OR: [{ desde: null }, { desde: { lte: now } }] },
        { OR: [{ hasta: null }, { hasta: { gte: now } }] },
      ],
    },
    orderBy: { prioridad: "desc" },
    take: 3,
  });

  if (promos.length === 0) return null;

  return (
    <section id="promos" className="scroll-mt-24 bg-cocoa py-16 text-cream">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-caramel-soft">
            Aprovechá
          </span>
          <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
            Promociones activas
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {promos.map((promo, i) => {
            const Icon = iconFor[promo.tipo] ?? Gift;
            return (
              <Reveal key={promo.id} delay={i * 0.06}>
                <div className="group relative h-full overflow-hidden rounded-[var(--radius-lg)] border border-cream/10 bg-cream/[0.04] p-6 transition-colors hover:bg-cream/[0.07]">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-caramel/20 text-caramel-soft">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">
                    {promo.nombre}
                  </h3>
                  <p className="mt-1 text-sm text-cream/60">
                    {promo.tipo === "HAPPY_HOUR" && promo.horaInicio != null
                      ? `Válido de ${promo.horaInicio} a ${promo.horaFin} hs`
                      : "Por tiempo limitado"}
                  </p>
                  <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-caramel/10 blur-2xl transition-all group-hover:bg-caramel/20" />
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-8">
            <Link
              href="/catalogo"
              className="inline-flex h-12 items-center rounded-full bg-caramel px-7 text-sm font-semibold text-primary-foreground transition-colors hover:bg-caramel-deep"
            >
              Ver productos en promo
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
