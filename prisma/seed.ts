import { PrismaClient, PromotionType, CouponType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_SETTINGS, SETTINGS_KEY } from "../src/domain/settings";

const prisma = new PrismaClient();

// Fotos de Unsplash (con fallback a placeholder branded en el front si fallan).
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

type SeedProduct = {
  nombre: string;
  descripcion: string;
  ingredientes: string;
  precio: number;
  stock: number;
  destacado?: boolean;
  tags?: string[];
  imagenes: string[];
};

// Tiempo estimado de preparación por categoría (minutos).
const PREP_MINUTOS: Record<string, number> = {
  Tortas: 240,
  Cheesecakes: 60,
  "Postres en vaso": 10,
  Brownies: 15,
  Cookies: 12,
  Alfajores: 8,
  "Box de regalo": 25,
};

const catalogo: Record<
  string,
  { emoji: string; productos: SeedProduct[] }
> = {
  Tortas: {
    emoji: "🎂",
    productos: [
      {
        nombre: "Torta Chocotorta",
        descripcion:
          "La clásica argentina: capas de chocolinas, dulce de leche y crema de queso con un toque de café.",
        ingredientes:
          "Galletitas de chocolate, dulce de leche, queso crema, café, cacao",
        precio: 24000,
        stock: 8,
        destacado: true,
        tags: ["más vendida", "sin horno"],
        imagenes: [img("1578985545062-69928b1d9587"), img("1565958011703-44f9829ba187")],
      },
      {
        nombre: "Torta Selva Negra",
        descripcion:
          "Bizcochuelo de chocolate húmedo, crema chantilly, cerezas y virutas de chocolate.",
        ingredientes: "Chocolate, crema, cerezas, kirsch, harina, huevos",
        precio: 28500,
        stock: 5,
        destacado: true,
        tags: ["premium"],
        imagenes: [img("1571115177098-24ec42ed204d"), img("1519869325930-281384150729")],
      },
      {
        nombre: "Torta Red Velvet",
        descripcion:
          "Terciopelo rojo con frosting de queso crema. Suave, húmeda y con presencia.",
        ingredientes: "Harina, cacao, buttermilk, queso crema, manteca",
        precio: 27000,
        stock: 4,
        tags: ["premium"],
        imagenes: [img("1586788680434-30d324b2d46f")],
      },
    ],
  },
  Cheesecakes: {
    emoji: "🍰",
    productos: [
      {
        nombre: "Cheesecake de Frutos Rojos",
        descripcion:
          "Base crocante, relleno cremoso de queso y una salsa artesanal de frutos rojos.",
        ingredientes: "Queso crema, frutos rojos, galletitas, manteca, crema",
        precio: 26000,
        stock: 6,
        destacado: true,
        tags: ["más vendida"],
        imagenes: [img("1533134242443-d4fd215305ad"), img("1524351199678-941a58a3df50")],
      },
      {
        nombre: "Cheesecake de Maracuyá",
        descripcion:
          "El equilibrio perfecto entre lo dulce y lo ácido. Fresco y tropical.",
        ingredientes: "Queso crema, maracuyá, galletitas, manteca",
        precio: 26500,
        stock: 5,
        imagenes: [img("1565958011703-44f9829ba187")],
      },
    ],
  },
  "Postres en vaso": {
    emoji: "🍮",
    productos: [
      {
        nombre: "Vasito Chocotorta",
        descripcion:
          "Nuestra chocotorta en formato individual. Ideal para darte un gusto.",
        ingredientes: "Chocolinas, dulce de leche, queso crema, cacao",
        precio: 4200,
        stock: 30,
        destacado: true,
        tags: ["individual", "más vendida"],
        imagenes: [img("1488477181946-6428a0291777")],
      },
      {
        nombre: "Vasito Tiramisú",
        descripcion:
          "Café, mascarpone y cacao en un vaso. Un clásico italiano irresistible.",
        ingredientes: "Mascarpone, café, vainillas, cacao",
        precio: 4500,
        stock: 24,
        tags: ["individual"],
        imagenes: [img("1571877227200-a0d98ea607e9")],
      },
      {
        nombre: "Vasito Oreo",
        descripcion: "Crema de Oreo, galleta triturada y más Oreo. Para fanáticos.",
        ingredientes: "Oreo, crema, queso crema, dulce de leche",
        precio: 4300,
        stock: 28,
        tags: ["individual"],
        imagenes: [img("1563805042-7684c019e1cb")],
      },
    ],
  },
  Brownies: {
    emoji: "🍫",
    productos: [
      {
        nombre: "Brownie con Nuez",
        descripcion:
          "Denso, húmedo y bien chocolatoso, con nueces tostadas. Porción generosa.",
        ingredientes: "Chocolate semiamargo, nueces, manteca, huevos, azúcar",
        precio: 3800,
        stock: 40,
        destacado: true,
        tags: ["más vendida"],
        imagenes: [img("1606313564200-e75d5e30476c")],
      },
      {
        nombre: "Brownie Dulce de Leche",
        descripcion: "Brownie relleno con dulce de leche repostero. Puro placer.",
        ingredientes: "Chocolate, dulce de leche, manteca, huevos",
        precio: 4000,
        stock: 35,
        imagenes: [img("1611293388250-580b08c4a145")],
      },
    ],
  },
  Cookies: {
    emoji: "🍪",
    productos: [
      {
        nombre: "Cookie Chips de Chocolate",
        descripcion:
          "Crocante por fuera, tierna por dentro, con abundantes chips de chocolate.",
        ingredientes: "Harina, chips de chocolate, manteca, azúcar rubia",
        precio: 2200,
        stock: 60,
        tags: ["individual"],
        imagenes: [img("1499636136210-6f4ee915583e")],
      },
      {
        nombre: "Cookie Red Velvet",
        descripcion: "Cookie roja con corazón de queso crema. Distinta y adictiva.",
        ingredientes: "Harina, cacao, queso crema, manteca",
        precio: 2500,
        stock: 45,
        imagenes: [img("1558961363-fa8fdf82db35")],
      },
    ],
  },
  Alfajores: {
    emoji: "🥮",
    productos: [
      {
        nombre: "Alfajor de Maicena",
        descripcion:
          "Tapitas que se deshacen, dulce de leche y coco. El de la abuela.",
        ingredientes: "Maicena, harina, dulce de leche, coco rallado",
        precio: 1800,
        stock: 80,
        destacado: true,
        tags: ["más vendida", "individual"],
        imagenes: [img("1587241321921-91a834d6d191")],
      },
      {
        nombre: "Alfajor de Chocolate",
        descripcion: "Doble tapa de chocolate, relleno de dulce de leche y baño premium.",
        ingredientes: "Cacao, dulce de leche, cobertura de chocolate",
        precio: 2100,
        stock: 70,
        imagenes: [img("1548907040-4baa42d10919")],
      },
    ],
  },
  "Box de regalo": {
    emoji: "🎁",
    productos: [
      {
        nombre: "Box Dulce Sorpresa",
        descripcion:
          "Selección de nuestros mejores postres individuales en una caja lista para regalar.",
        ingredientes: "Surtido de vasitos, brownies, cookies y alfajores",
        precio: 18500,
        stock: 12,
        destacado: true,
        tags: ["regalo", "premium"],
        imagenes: [img("1549007994-cb92caebd54b"), img("1607478900766-efe13248b125")],
      },
    ],
  },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("🌱 Seed iniciando...");

  // Limpieza idempotente
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.promotionProduct.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const productIdsByName = new Map<string, string>();
  const categoryIdsByName = new Map<string, string>();
  let catOrden = 0;

  for (const [catNombre, { emoji, productos }] of Object.entries(catalogo)) {
    const category = await prisma.category.create({
      data: {
        nombre: catNombre,
        slug: slugify(catNombre),
        emoji,
        orden: catOrden++,
      },
    });
    categoryIdsByName.set(catNombre, category.id);

    let prodOrden = 0;
    for (const p of productos) {
      const product = await prisma.product.create({
        data: {
          nombre: p.nombre,
          slug: slugify(p.nombre),
          descripcion: p.descripcion,
          ingredientes: p.ingredientes,
          precio: p.precio,
          stock: p.stock,
          prepMinutos: PREP_MINUTOS[catNombre] ?? 15,
          destacado: p.destacado ?? false,
          tags: p.tags ?? [],
          orden: prodOrden++,
          categoryId: category.id,
          imagenes: {
            create: p.imagenes.map((url, i) => ({
              url,
              alt: p.nombre,
              orden: i,
            })),
          },
        },
      });
      productIdsByName.set(p.nombre, product.id);
    }
  }

  // Promoción: Happy Hour 20% en Postres en vaso (16 a 19 hs)
  await prisma.promotion.create({
    data: {
      nombre: "Happy Hour · Postres en vaso -20%",
      tipo: PromotionType.HAPPY_HOUR,
      valor: 20,
      horaInicio: 16,
      horaFin: 19,
      prioridad: 10,
      activo: true,
      categorias: [categoryIdsByName.get("Postres en vaso")!],
    },
  });

  // Promoción: 3x2 en Alfajores
  const alfa1 = productIdsByName.get("Alfajor de Maicena")!;
  const alfa2 = productIdsByName.get("Alfajor de Chocolate")!;
  await prisma.promotion.create({
    data: {
      nombre: "3x2 en Alfajores",
      tipo: PromotionType.TRES_POR_DOS,
      prioridad: 5,
      activo: true,
      productos: { create: [{ productId: alfa1 }, { productId: alfa2 }] },
    },
  });

  // Cupón de bienvenida
  await prisma.coupon.create({
    data: {
      codigo: "BIENVENIDA10",
      tipo: CouponType.PORCENTAJE,
      valor: 10,
      montoMinimo: 10000,
      usosMax: 100,
      activo: true,
    },
  });

  // Configuración del negocio
  await prisma.setting.upsert({
    where: { clave: SETTINGS_KEY },
    create: { clave: SETTINGS_KEY, valor: DEFAULT_SETTINGS },
    update: { valor: DEFAULT_SETTINGS },
  });

  // Admin inicial
  const email = process.env.ADMIN_EMAIL ?? "admin@elgustodemipueblo.com.ar";
  const password = process.env.ADMIN_PASSWORD ?? "egmp2026";
  const nombre = process.env.ADMIN_NAME ?? "Admin";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, nombre, passwordHash, rol: "OWNER" },
    update: { nombre, passwordHash },
  });

  console.log(`✅ Seed completo. Admin: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
