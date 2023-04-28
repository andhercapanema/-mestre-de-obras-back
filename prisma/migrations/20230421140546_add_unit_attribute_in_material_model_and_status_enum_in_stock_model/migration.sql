/*
  Warnings:

  - Added the required column `unit` to the `materials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `stocks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StockStatus" AS ENUM ('available', 'consumed');

-- AlterTable
ALTER TABLE "materials" ADD COLUMN     "unit" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "stocks" ADD COLUMN     "status" "StockStatus" NOT NULL;
