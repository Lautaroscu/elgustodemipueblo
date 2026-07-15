"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Cake,
  Ticket,
  Percent,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Truck,
} from "lucide-react";
import { LogoMark } from "@/components/shared/logo";
import { logout } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/logistica", label: "Logística", icon: Truck },
  { href: "/admin/productos", label: "Productos", icon: Cake },
  { href: "/admin/promociones", label: "Promociones", icon: Percent },
  { href: "/admin/cupones", label: "Cupones", icon: Ticket },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminNav({ nombre }: { nombre: string }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const links = (
    <nav className="flex flex-1 flex-col gap-1">
      {nav.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-caramel/12 text-caramel-deep"
                : "text-cocoa-soft hover:bg-cream-2 hover:text-cocoa",
            )}
          >
            <item.icon className="h-[1.15rem] w-[1.15rem]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Topbar mobile */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark className="h-8 w-8" />
          <span className="font-display text-sm font-semibold text-cocoa">
            Admin
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          className="grid h-10 w-10 place-items-center rounded-full text-cocoa hover:bg-cream-2"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-cocoa-deep/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col gap-4 bg-surface p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2">
                <LogoMark className="h-9 w-9" />
                <span className="font-display font-semibold text-cocoa">
                  Admin
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
                className="grid h-9 w-9 place-items-center rounded-full text-cocoa hover:bg-cream-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {links}
            <LogoutButton />
          </aside>
        </div>
      )}

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-4 border-r border-border bg-surface p-4 lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-2 py-2">
          <LogoMark className="h-9 w-9" />
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold text-cocoa">
              El Gusto de mi Pueblo
            </p>
            <p className="text-xs text-muted">Administración</p>
          </div>
        </Link>
        {links}
        <div className="border-t border-border pt-3">
          <p className="px-3 pb-2 text-xs text-muted">
            Hola, <span className="font-medium text-cocoa">{nombre}</span>
          </p>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium text-cocoa-soft transition-colors hover:bg-danger/10 hover:text-danger"
      >
        <LogOut className="h-[1.15rem] w-[1.15rem]" /> Cerrar sesión
      </button>
    </form>
  );
}
