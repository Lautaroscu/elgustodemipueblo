"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { LogoMark } from "@/components/shared/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authenticate } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-caramel text-sm font-semibold text-primary-foreground shadow-[0_10px_28px_-8px_rgba(197,123,44,0.8)] transition-all hover:bg-caramel-deep active:scale-[0.98] disabled:opacity-60"
    >
      {pending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" /> Ingresando…
        </>
      ) : (
        <>
          <Lock className="h-4 w-4" /> Ingresar
        </>
      )}
    </button>
  );
}

export default function LoginPage() {
  const [error, formAction] = useActionState(authenticate, undefined);

  return (
    <div className="grid min-h-dvh place-items-center bg-cream px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark className="h-14 w-14" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-cocoa">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm text-muted">El Gusto de mi Pueblo</p>
        </div>

        <form
          action={formAction}
          className="space-y-4 rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-[var(--shadow-soft)]"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="admin@elgustodemipueblo.com.ar"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="rounded-[var(--radius-md)] bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <SubmitButton />
        </form>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted">
          <ShieldCheck className="h-3.5 w-3.5" /> Acceso seguro y encriptado
        </p>
      </div>
    </div>
  );
}
