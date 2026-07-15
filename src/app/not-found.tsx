import Link from "next/link";
import { LogoMark } from "@/components/shared/logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-cream px-4 text-center">
      <div>
        <LogoMark className="mx-auto h-16 w-16" />
        <p className="mt-6 font-display text-6xl font-bold text-cocoa">404</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-cocoa">
          No encontramos esta página
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          Puede que el enlace esté roto o que el postre ya no exista. Volvé al
          catálogo para seguir disfrutando.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full border border-cocoa/20 px-6 text-sm font-medium text-cocoa transition-colors hover:bg-cocoa hover:text-cream"
          >
            Ir al inicio
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex h-11 items-center rounded-full bg-caramel px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-caramel-deep"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
