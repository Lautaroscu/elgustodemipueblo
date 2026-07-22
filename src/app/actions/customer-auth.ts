"use server";

import { signIn, signOut, isGoogleConfigured } from "@/auth";
import { getCustomerSession, getCurrentCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/db";

export async function getCustomerSessionAction() {
  const session = await getCustomerSession();
  return {
    session,
    googleConfigured: isGoogleConfigured,
  };
}

export async function signInWithGoogle(redirectTo?: string) {
  await signIn("google", { redirectTo: redirectTo || "/pedidos" });
}

export async function signOutCustomer(redirectTo?: string) {
  await signOut({ redirectTo: redirectTo || "/" });
}

export async function completeCustomerPhoneAction(phoneRaw: string) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return { ok: false, error: "No iniciaste sesión." };
  }

  const phone = phoneRaw.trim();
  if (phone.length < 6) {
    return { ok: false, error: "Ingresá un número de teléfono válido." };
  }

  try {
    // Buscar si existía un Customer previo (ej. de compras como invitado) con ese teléfono
    const existingGuest = await prisma.customer.findFirst({
      where: { telefono: phone, NOT: { id: customer.id } },
    });

    if (existingGuest) {
      // Reasignar órdenes y direcciones del guest al Customer actual de Google
      await prisma.$transaction([
        prisma.order.updateMany({
          where: { customerId: existingGuest.id },
          data: { customerId: customer.id },
        }),
        prisma.address.updateMany({
          where: { customerId: existingGuest.id },
          data: { customerId: customer.id },
        }),
        prisma.customer.delete({
          where: { id: existingGuest.id },
        }),
      ]);
    }

    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: { telefono: phone },
    });

    return { ok: true, customer: updated };
  } catch (err: any) {
    console.error("Error al vincular el teléfono del cliente:", err);
    return { ok: false, error: "Hubo un error al actualizar tu teléfono." };
  }
}

export async function getCustomerOrdersAction() {
  const session = await getCustomerSession();
  if (!session?.customerId) return [];

  const orders = await prisma.order.findMany({
    where: { customerId: session.customerId },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return orders;
}
