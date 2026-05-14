/*
  Warnings:

  - You are about to drop the column `shoppingCartId` on the `Client` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_shoppingCartId_fkey";

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "shoppingCartId";

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "ShoppingCart"("id") ON DELETE SET NULL ON UPDATE CASCADE;
