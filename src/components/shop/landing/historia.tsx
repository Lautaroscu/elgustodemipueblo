import { Heart, Sparkles, Clock } from "lucide-react";
import { ProductImage } from "@/components/shared/product-image";
import { Reveal } from "@/components/shared/reveal";

const valores = [
  {
    icon: Heart,
    title: "Hecho a mano",
    desc: "Cada postre se prepara por encargo, con ingredientes frescos y recetas de familia.",
  },
  {
    icon: Sparkles,
    title: "Sin conservantes",
    desc: "Sabor real, como el de casa. Nada de premezclas ni atajos.",
  },
  {
    icon: Clock,
    title: "Siempre a tiempo",
    desc: "Coordinamos la entrega para que llegue perfecto el día que lo necesitás.",
  },
];

export function Historia() {
  return (
    <section id="historia" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[var(--shadow-lift)]">
              <ProductImage
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
                alt="Facundo en su cocina preparando postres"
                emoji="👨‍🍳"
                fill
                sizes="(max-width:1024px) 90vw, 480px"
              />
            </div>
            <div className="absolute -right-3 -top-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow-lift)]">
              <p className="font-display text-2xl font-bold text-caramel-deep">
                +1.300
              </p>
              <p className="text-xs text-muted">clientes felices</p>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-caramel-deep">
              Nuestra historia
            </span>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-cocoa text-balance sm:text-4xl">
              Empezó en la cocina de casa, con una receta y muchas ganas
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="mt-5 space-y-4 text-cocoa-soft leading-relaxed">
              <p>
                El Gusto de mi Pueblo nació del sueño de Facundo por compartir
                los sabores que aprendió de su familia. Lo que empezó como un
                pedido entre amigos hoy es el postre favorito de cientos de
                vecinos.
              </p>
              <p>
                Creemos que un buen postre se nota: en la calidad de los
                ingredientes, en el punto justo del dulce de leche y en la
                dedicación de hacer las cosas bien. Por eso cada pedido se
                prepara con el mismo cariño del primer día.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {valores.map((v, i) => (
              <Reveal key={v.title} delay={0.1 + i * 0.06}>
                <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-caramel/12 text-caramel-deep">
                    <v.icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-cocoa">
                    {v.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {v.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
