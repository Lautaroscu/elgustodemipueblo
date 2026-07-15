import "server-only";
import { prisma } from "@/lib/db";
import { buildResumen, type AddressData } from "@/domain/address";

export async function getCustomerAddresses(customerId: string) {
  return prisma.address.findMany({
    where: { customerId },
    orderBy: [{ esPredeterminada: "desc" }, { updatedAt: "desc" }],
  });
}

/** Direcciones guardadas de un cliente identificado por teléfono (sin login). */
export async function getAddressesByPhone(telefono: string) {
  const clean = telefono.trim();
  if (clean.length < 6) return { customerId: null, nombre: null, direcciones: [] };
  const customer = await prisma.customer.findUnique({
    where: { telefono: clean },
    include: {
      direcciones: {
        orderBy: [{ esPredeterminada: "desc" }, { updatedAt: "desc" }],
      },
    },
  });
  if (!customer) return { customerId: null, nombre: null, direcciones: [] };
  return {
    customerId: customer.id,
    nombre: customer.nombre,
    direcciones: customer.direcciones,
  };
}

export async function createAddress(
  customerId: string,
  input: {
    etiqueta?: string;
    datos: AddressData;
    lat?: number | null;
    lng?: number | null;
    esPredeterminada?: boolean;
  },
) {
  const existentes = await prisma.address.count({ where: { customerId } });
  const esPredeterminada = input.esPredeterminada ?? existentes === 0;

  if (esPredeterminada) {
    await prisma.address.updateMany({
      where: { customerId },
      data: { esPredeterminada: false },
    });
  }

  return prisma.address.create({
    data: {
      customerId,
      etiqueta: input.etiqueta || "Casa",
      datos: input.datos,
      resumen: buildResumen(input.datos),
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      esPredeterminada,
    },
  });
}

export async function updateAddress(
  id: string,
  customerId: string,
  input: { etiqueta?: string; datos: AddressData },
) {
  return prisma.address.update({
    where: { id, customerId },
    data: {
      ...(input.etiqueta ? { etiqueta: input.etiqueta } : {}),
      datos: input.datos,
      resumen: buildResumen(input.datos),
    },
  });
}

export async function deleteAddress(id: string, customerId: string) {
  await prisma.address.delete({ where: { id, customerId } });
}

export async function setDefaultAddress(id: string, customerId: string) {
  await prisma.$transaction([
    prisma.address.updateMany({
      where: { customerId },
      data: { esPredeterminada: false },
    }),
    prisma.address.update({
      where: { id, customerId },
      data: { esPredeterminada: true },
    }),
  ]);
}
