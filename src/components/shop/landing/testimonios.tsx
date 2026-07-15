import { Star, Quote } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";

const testimonios = [
  {
    nombre: "Sofía G.",
    texto:
      "La chocotorta es LA MEJOR que probé. Llegó impecable y el trato divino. Ya pedí tres veces 🤎",
    inicial: "S",
  },
  {
    nombre: "Martín R.",
    texto:
      "Pedí un box de regalo para mi vieja y quedó feliz. Todo fresquísimo y hecho con onda.",
    inicial: "M",
  },
  {
    nombre: "Caro P.",
    texto:
      "Los vasitos son un vicio. Pido por WhatsApp y en un rato los tengo en casa. Recomendadísimo.",
    inicial: "C",
  },
];

export function Testimonios() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-caramel-deep">
            Lo que dicen
          </span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-cocoa sm:text-4xl">
            Clientes que repiten
          </h2>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {testimonios.map((t, i) => (
          <Reveal key={t.nombre} delay={i * 0.07}>
            <figure className="relative flex h-full flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
              <Quote className="h-7 w-7 text-caramel-soft" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-cocoa-soft">
                “{t.texto}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-caramel/15 font-display font-semibold text-caramel-deep">
                  {t.inicial}
                </span>
                <div>
                  <p className="text-sm font-semibold text-cocoa">{t.nombre}</p>
                  <div className="flex text-caramel">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                </div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
