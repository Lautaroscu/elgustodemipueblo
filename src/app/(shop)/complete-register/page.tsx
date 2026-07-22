import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PhoneForm } from "./phone-form";
import { Smartphone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CompleteRegisterPage() {
  const session = await auth();

  // Si no está logueado o ya tiene teléfono, redirigir al catálogo o home
  if (!session || !session.user || session.user.kind !== "customer") {
    redirect("/");
  }

  const user = session.user;
  if (!user.requiresPhone) {
    redirect("/pedidos");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 flex flex-col justify-center min-h-[70vh]">
      <div className="rounded-[var(--radius-xl)] border border-border bg-surface p-6 sm:p-8 space-y-6 shadow-md">
        <div className="text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-cream-2 flex items-center justify-center text-caramel">
            <Smartphone className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-cocoa">
            Completá tu perfil
          </h1>
          <p className="text-sm text-cocoa-soft leading-relaxed">
            ¡Hola, <strong className="text-cocoa">{user.name}</strong>! Para finalizar tu registro y vincular tus pedidos pasados necesitamos tu teléfono.
          </p>
        </div>

        <PhoneForm user={user} />
      </div>
    </div>
  );
}
