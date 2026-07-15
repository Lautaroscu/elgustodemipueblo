import { cache } from "react";
import { prisma } from "@/lib/db";

/** Categorías visibles con sus productos visibles, ordenadas. */
export const getCategoriesWithProducts = cache(async () => {
  return prisma.category.findMany({
    where: { visible: true },
    orderBy: { orden: "asc" },
    include: {
      productos: {
        where: { visible: true },
        orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
        include: { imagenes: { orderBy: { orden: "asc" } } },
      },
    },
  });
});

export const getCategories = cache(async () => {
  return prisma.category.findMany({
    where: { visible: true },
    orderBy: { orden: "asc" },
  });
});

export const getFeaturedProducts = cache(async () => {
  return prisma.product.findMany({
    where: { visible: true, destacado: true },
    orderBy: { orden: "asc" },
    take: 8,
    include: {
      imagenes: { orderBy: { orden: "asc" } },
      category: true,
    },
  });
});

export const getAllVisibleProducts = cache(async () => {
  return prisma.product.findMany({
    where: { visible: true },
    orderBy: [{ orden: "asc" }, { createdAt: "asc" }],
    include: {
      imagenes: { orderBy: { orden: "asc" } },
      category: true,
    },
  });
});

export const getProductBySlug = cache(async (slug: string) => {
  return prisma.product.findFirst({
    where: { slug, visible: true },
    include: {
      imagenes: { orderBy: { orden: "asc" } },
      category: true,
    },
  });
});

export type ProductWithRelations = Awaited<
  ReturnType<typeof getAllVisibleProducts>
>[number];

export type CategoryWithProducts = Awaited<
  ReturnType<typeof getCategoriesWithProducts>
>[number];
