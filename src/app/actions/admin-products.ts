"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { slugify } from "@/lib/utils";
import { deleteCloudinaryImage } from "@/lib/cloudinary";

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional().nullable(),
  alt: z.string().optional().nullable(),
});

const productSchema = z.object({
  nombre: z.string().trim().min(2, "Nombre muy corto").max(100),
  descripcion: z.string().trim().min(1, "Agregá una descripción").max(600),
  ingredientes: z.string().trim().max(400).optional().nullable(),
  precio: z.number().int().min(0),
  stock: z.number().int().min(0),
  categoryId: z.string().min(1, "Elegí una categoría"),
  tags: z.array(z.string().trim()).max(6).default([]),
  destacado: z.boolean().default(false),
  visible: z.boolean().default(true),
  imagenes: z.array(imageSchema).max(8).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || "producto";
  let slug = root;
  let n = 1;
  while (true) {
    const found = await prisma.product.findUnique({ where: { slug } });
    if (!found || found.id === excludeId) return slug;
    slug = `${root}-${++n}`;
  }
}

export async function createProduct(raw: ProductInput) {
  await requireAdmin();
  const data = productSchema.parse(raw);
  const slug = await uniqueSlug(data.nombre);

  const maxOrden = await prisma.product.aggregate({ _max: { orden: true } });

  const product = await prisma.product.create({
    data: {
      nombre: data.nombre,
      slug,
      descripcion: data.descripcion,
      ingredientes: data.ingredientes || null,
      precio: data.precio,
      stock: data.stock,
      categoryId: data.categoryId,
      tags: data.tags.filter(Boolean),
      destacado: data.destacado,
      visible: data.visible,
      orden: (maxOrden._max.orden ?? 0) + 1,
      imagenes: {
        create: data.imagenes.map((img, i) => ({
          url: img.url,
          publicId: img.publicId || null,
          alt: img.alt || data.nombre,
          orden: i,
        })),
      },
    },
  });

  revalidatePaths();
  return { ok: true, id: product.id };
}

export async function updateProduct(id: string, raw: ProductInput) {
  await requireAdmin();
  const data = productSchema.parse(raw);
  const slug = await uniqueSlug(data.nombre, id);

  await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.product.update({
      where: { id },
      data: {
        nombre: data.nombre,
        slug,
        descripcion: data.descripcion,
        ingredientes: data.ingredientes || null,
        precio: data.precio,
        stock: data.stock,
        categoryId: data.categoryId,
        tags: data.tags.filter(Boolean),
        destacado: data.destacado,
        visible: data.visible,
        imagenes: {
          create: data.imagenes.map((img, i) => ({
            url: img.url,
            publicId: img.publicId || null,
            alt: img.alt || data.nombre,
            orden: i,
          })),
        },
      },
    });
  });

  revalidatePaths();
  return { ok: true, id };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const images = await prisma.productImage.findMany({ where: { productId: id } });
  // Intenta limpiar Cloudinary (no bloquea).
  for (const img of images) {
    if (img.publicId) void deleteCloudinaryImage(img.publicId).catch(() => {});
  }
  try {
    await prisma.product.delete({ where: { id } });
  } catch {
    // Si tiene pedidos asociados, lo ocultamos en vez de borrar.
    await prisma.product.update({
      where: { id },
      data: { visible: false },
    });
    revalidatePaths();
    return {
      ok: true,
      softDeleted: true,
      message: "El producto tiene pedidos asociados: se ocultó en lugar de eliminarse.",
    };
  }
  revalidatePaths();
  return { ok: true };
}

export async function duplicateProduct(id: string) {
  await requireAdmin();
  const p = await prisma.product.findUnique({
    where: { id },
    include: { imagenes: true },
  });
  if (!p) return { ok: false, error: "No encontrado" };

  const slug = await uniqueSlug(`${p.nombre} copia`);
  const maxOrden = await prisma.product.aggregate({ _max: { orden: true } });

  const nuevo = await prisma.product.create({
    data: {
      nombre: `${p.nombre} (copia)`,
      slug,
      descripcion: p.descripcion,
      ingredientes: p.ingredientes,
      precio: p.precio,
      stock: p.stock,
      categoryId: p.categoryId,
      tags: p.tags,
      destacado: false,
      visible: false,
      orden: (maxOrden._max.orden ?? 0) + 1,
      imagenes: {
        create: p.imagenes.map((img) => ({
          url: img.url,
          publicId: img.publicId,
          alt: img.alt,
          orden: img.orden,
        })),
      },
    },
  });
  revalidatePaths();
  return { ok: true, id: nuevo.id };
}

export async function toggleProductFlag(
  id: string,
  field: "visible" | "destacado",
  value: boolean,
) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { [field]: value } });
  revalidatePaths();
  return { ok: true };
}

export async function quickUpdate(
  id: string,
  data: { precio?: number; stock?: number },
) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data });
  revalidatePaths();
  return { ok: true };
}

function revalidatePaths() {
  revalidatePath("/admin/productos");
  revalidatePath("/catalogo");
  revalidatePath("/");
}
