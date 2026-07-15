-- CreateEnum
CREATE TYPE "ScheduleKind" AS ENUM ('ASAP', 'PROGRAMADO');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'EN_REPARTO', 'ENTREGADO', 'CANCELADO');
ALTER TABLE "public"."Order" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "estado" TYPE "OrderStatus_new" USING ("estado"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "estado" SET DEFAULT 'PENDIENTE';
COMMIT;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "imagen" TEXT,
ALTER COLUMN "telefono" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "addressId" TEXT,
ADD COLUMN     "cuando" "ScheduleKind" NOT NULL DEFAULT 'ASAP',
ADD COLUMN     "entregaDatos" JSONB,
ADD COLUMN     "fechaEntrega" TIMESTAMP(3),
ADD COLUMN     "prepInicioEstimado" TIMESTAMP(3),
ADD COLUMN     "prepMinutos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prioridad" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "prepMinutos" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "OrderEvent" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "estado" "OrderStatus" NOT NULL,
    "nota" TEXT,
    "actor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL DEFAULT 'Casa',
    "datos" JSONB NOT NULL,
    "resumen" TEXT NOT NULL DEFAULT '',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "esPredeterminada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderEvent_orderId_idx" ON "OrderEvent"("orderId");

-- CreateIndex
CREATE INDEX "Address_customerId_idx" ON "Address"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_googleId_key" ON "Customer"("googleId");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Order_fechaEntrega_idx" ON "Order"("fechaEntrega");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderEvent" ADD CONSTRAINT "OrderEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

