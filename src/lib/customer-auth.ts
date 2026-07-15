import "server-only";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

/** Devuelve el Customer logueado (Google) o null si es guest/admin. */
export async function getCurrentCustomer() {
  const session = await auth();
  if (session?.user?.kind !== "customer" || !session.user.customerId) {
    return null;
  }
  return prisma.customer.findUnique({
    where: { id: session.user.customerId },
  });
}

/** Sesión liviana de cliente para componentes (sin golpear la DB). */
export async function getCustomerSession() {
  const session = await auth();
  if (session?.user?.kind !== "customer") return null;
  return {
    customerId: session.user.customerId!,
    nombre: session.user.name ?? "Cliente",
    email: session.user.email ?? null,
    imagen: session.user.image ?? null,
  };
}
