/*
  Warnings:

  - You are about to alter the column `nomeusuario` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(45)`.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "nomeusuario" SET DATA TYPE VARCHAR(45);
