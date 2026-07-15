"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCustomer } from "@/lib/customer-auth";
import {
  getAddressesByPhone,
  getCustomerAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/data/addresses";
import type { AddressData } from "@/domain/address";

/** Público: reconoce a un cliente recurrente por teléfono y trae sus direcciones. */
export async function lookupByPhoneAction(telefono: string) {
  const res = await getAddressesByPhone(telefono);
  return {
    reconocido: !!res.customerId,
    nombre: res.nombre,
    direcciones: res.direcciones.map((d) => ({
      id: d.id,
      etiqueta: d.etiqueta,
      resumen: d.resumen,
      datos: d.datos as AddressData,
      esPredeterminada: d.esPredeterminada,
    })),
  };
}

async function requireCustomer() {
  const c = await getCurrentCustomer();
  if (!c) throw new Error("Iniciá sesión para gestionar tus direcciones.");
  return c;
}

export async function myAddressesAction() {
  const c = await requireCustomer();
  const list = await getCustomerAddresses(c.id);
  return list.map((d) => ({
    id: d.id,
    etiqueta: d.etiqueta,
    resumen: d.resumen,
    datos: d.datos as AddressData,
    esPredeterminada: d.esPredeterminada,
  }));
}

export async function createAddressAction(input: {
  etiqueta?: string;
  datos: AddressData;
  esPredeterminada?: boolean;
}) {
  const c = await requireCustomer();
  await createAddress(c.id, input);
  revalidatePath("/mi-cuenta");
  return { ok: true };
}

export async function updateAddressAction(
  id: string,
  input: { etiqueta?: string; datos: AddressData },
) {
  const c = await requireCustomer();
  await updateAddress(id, c.id, input);
  revalidatePath("/mi-cuenta");
  return { ok: true };
}

export async function deleteAddressAction(id: string) {
  const c = await requireCustomer();
  await deleteAddress(id, c.id);
  revalidatePath("/mi-cuenta");
  return { ok: true };
}

export async function setDefaultAddressAction(id: string) {
  const c = await requireCustomer();
  await setDefaultAddress(id, c.id);
  revalidatePath("/mi-cuenta");
  return { ok: true };
}
