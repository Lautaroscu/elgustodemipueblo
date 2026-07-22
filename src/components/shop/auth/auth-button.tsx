"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, LogOut } from "lucide-react";

export function AuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirigir si falta completar teléfono
  useEffect(() => {
    if (session?.user && (session.user as any).requiresPhone) {
      router.push("/complete-register");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="h-9 w-24 animate-pulse rounded-full bg-cream-2/60" />
    );
  }

  if (session && session.user && session.user.kind === "customer") {
    const user = session.user;
    const firstName = user.name?.split(" ")[0] ?? "Cliente";

    return (
      <div className="flex items-center gap-2.5">
        <Link
          href="/pedidos"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-cocoa-soft hover:bg-cream-2 hover:text-cocoa transition-colors"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-caramel" />
          <span>Mis compras</span>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 shadow-sm">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || "Perfil"}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <span className="h-6 w-6 rounded-full bg-caramel/15 text-caramel-deep flex items-center justify-center text-xs font-bold">
              {user.name?.charAt(0).toUpperCase() ?? "C"}
            </span>
          )}
          <span className="hidden md:inline-block text-xs font-semibold text-cocoa pr-1">
            {firstName}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Cerrar sesión"
            className="flex items-center text-xs font-medium text-danger/80 hover:text-danger border-l border-border/80 pl-2 ml-0.5 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/pedidos" })}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-cocoa shadow-sm transition-all hover:bg-cream-2 hover:border-caramel/40 cursor-pointer"
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38Z"
        />
      </svg>
      <span>Ingresar</span>
    </button>
  );
}
