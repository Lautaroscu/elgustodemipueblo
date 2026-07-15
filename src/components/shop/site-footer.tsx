import Link from "next/link";
import { MapPin, Clock } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { InstagramIcon, WhatsappIcon } from "@/components/shared/icons";
import { getSettings } from "@/data/settings";
import { waLink } from "@/lib/whatsapp";

export async function SiteFooter() {
  const s = await getSettings();

  return (
    <footer className="mt-24 border-t border-border bg-cocoa text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="[&_span]:text-cream [&_.text-caramel-deep]:text-caramel-soft [&_.text-cocoa]:text-cream">
            <Logo />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
            Postres artesanales hechos con amor. Pedí online en un minuto y
            disfrutá.
          </p>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-cream">
            Navegá
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-cream/70">
            <li>
              <Link href="/catalogo" className="hover:text-caramel-soft">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/#historia" className="hover:text-caramel-soft">
                Nuestra historia
              </Link>
            </li>
            <li>
              <Link href="/#promos" className="hover:text-caramel-soft">
                Promociones
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="hover:text-caramel-soft">
                Preguntas frecuentes
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-semibold text-cream">
            Contacto
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-cream/70">
            <li>
              <a
                href={waLink(s.whatsapp, "¡Hola! Quiero hacer un pedido 🍰")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-caramel-soft"
              >
                <WhatsappIcon className="h-4 w-4" /> WhatsApp
              </a>
            </li>
            <li>
              <a
                href={s.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-caramel-soft"
              >
                <InstagramIcon className="h-4 w-4" /> Instagram
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {s.direccion}
            </li>
            <li className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" /> {s.horarios}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-cream/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {s.nombre}. Hecho con amor 🤎
          </p>
          <Link href="/admin" className="hover:text-caramel-soft">
            Acceso administración
          </Link>
        </div>
      </div>
    </footer>
  );
}
