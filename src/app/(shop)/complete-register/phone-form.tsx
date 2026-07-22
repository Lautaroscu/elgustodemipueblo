"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { completeCustomerPhoneAction } from "@/app/actions/customer-auth";

export function PhoneForm({ user }: { user: any }) {
  const { update } = useSession();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (phone.trim().length < 6) {
      setError("Ingresá un número de teléfono válido.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await completeCustomerPhoneAction(phone);

    if (!res.ok || !res.customer) {
      setError(res.error || "Hubo un error al registrar el teléfono");
      setLoading(false);
      return;
    }

    // Actualizar la sesión en el cliente
    await update({
      customerId: res.customer.id,
      phone: res.customer.telefono,
      requiresPhone: false,
    });

    router.push("/pedidos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="phone"
          className="block text-xs font-bold uppercase tracking-wider text-cocoa-soft mb-2"
        >
          Número de teléfono / WhatsApp
        </label>
        <input
          id="phone"
          type="tel"
          placeholder="Ej: 2281 40-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-sm text-cocoa outline-none transition-all duration-200 focus:border-caramel focus:ring-3 focus:ring-caramel/20"
        />
      </div>

      {error && (
        <p className="rounded-[var(--radius-md)] border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger font-medium">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || phone.trim().length < 6}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-caramel py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-[0_6px_20px_-8px_rgba(197,123,44,0.7)] transition-all hover:bg-caramel-deep disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
          </>
        ) : (
          "Completar Registro"
        )}
      </button>
    </form>
  );
}
