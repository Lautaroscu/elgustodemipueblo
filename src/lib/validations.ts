import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  cantidad: z.number().int().min(1).max(99),
});

export const createOrderSchema = z.object({
  cliente: z.object({
    nombre: z.string().trim().min(2, "Ingresá tu nombre").max(80),
    telefono: z
      .string()
      .trim()
      .min(6, "Ingresá un teléfono válido")
      .max(30)
      .regex(/^[0-9+\-\s()]+$/, "Teléfono inválido"),
    email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  }),
  metodoEntrega: z.enum(["ENVIO", "RETIRO"]),
  zona: z.string().optional(),
  // Campos de entrega dinámicos (clave → valor). Reemplaza `direccion`.
  entregaDatos: z.record(z.string(), z.string()).optional(),
  addressId: z.string().optional(),
  guardarDireccion: z.boolean().optional(),
  etiquetaDireccion: z.string().max(30).optional(),
  metodoPago: z.enum(["MERCADO_PAGO", "TRANSFERENCIA", "EFECTIVO"]),
  observaciones: z.string().trim().max(400).optional(),
  cupon: z.string().trim().max(40).optional(),
  // Cuándo quiere el pedido.
  cuando: z.enum(["ASAP", "PROGRAMADO"]).default("ASAP"),
  fechaEntrega: z.string().datetime().optional().nullable(),
  items: z.array(cartItemSchema).min(1, "Tu pedido está vacío"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
