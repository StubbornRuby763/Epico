-- CreateTable
CREATE TABLE "ProductDiscount" (
    "id" SERIAL NOT NULL,
    "percent" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "ProductDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductDiscount_productId_key" ON "ProductDiscount"("productId");

-- AddForeignKey
ALTER TABLE "ProductDiscount" ADD CONSTRAINT "ProductDiscount_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
