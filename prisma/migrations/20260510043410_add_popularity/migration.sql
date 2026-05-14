/*
  Warnings:

  - A unique constraint covering the columns `[image]` on the table `Client` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image` to the `Client` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "image" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "popularity" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Client_image_key" ON "Client"("image");
