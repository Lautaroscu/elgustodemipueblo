import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const categories = await prisma.category.findMany({
    orderBy: { orden: "asc" },
    select: { id: true, nombre: true },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/productos"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-cocoa"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a productos
      </Link>
      <h1 className="mb-6 font-display text-2xl font-semibold text-cocoa">
        Nuevo producto
      </h1>
      <ProductForm categories={categories} />
    </div>
  );
}
