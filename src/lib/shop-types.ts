import type { ProductWithRelations } from "@/data/catalog";

/** Forma liviana y serializable de un producto para componentes cliente. */
export type ShopProduct = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  tags: string[];
  categoryId: string;
  categoryNombre: string;
  categoryEmoji: string;
  imagen: string | null;
  imagenAlt: string;
};

export function toShopProduct(p: ProductWithRelations): ShopProduct {
  return {
    id: p.id,
    slug: p.slug,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precio: p.precio,
    stock: p.stock,
    tags: p.tags,
    categoryId: p.categoryId,
    categoryNombre: p.category.nombre,
    categoryEmoji: p.category.emoji ?? "🍰",
    imagen: p.imagenes[0]?.url ?? null,
    imagenAlt: p.imagenes[0]?.alt ?? p.nombre,
  };
}
