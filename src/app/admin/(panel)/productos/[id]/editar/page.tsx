import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { imagenes: { orderBy: { orden: "asc" } } },
    }),
    prisma.category.findMany({
      orderBy: { orden: "asc" },
      select: { id: true, nombre: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/productos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-cocoa"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a productos
      </Link>
      <h1 className="mb-6 font-display text-2xl font-semibold text-cocoa">
        Editar producto
      </h1>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          nombre: product.nombre,
          descripcion: product.descripcion,
          ingredientes: product.ingredientes ?? "",
          precio: product.precio,
          stock: product.stock,
          categoryId: product.categoryId,
          tags: product.tags.join(", "),
          destacado: product.destacado,
          visible: product.visible,
          imagenes: product.imagenes.map((i) => ({
            id: i.id,
            url: i.url,
            publicId: i.publicId,
            alt: i.alt,
          })),
        }}
      />
    </div>
  );
}
