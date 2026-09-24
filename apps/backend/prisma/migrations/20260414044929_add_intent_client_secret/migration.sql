/*
  Warnings:

  - A unique constraint covering the columns `[clientSecret]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "clientSecret" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_clientSecret_key" ON "Transaction"("clientSecret");
