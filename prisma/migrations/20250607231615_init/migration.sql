/*
  Warnings:

  - You are about to drop the column `email` on the `ConfirmacaoEmail` table. All the data in the column will be lost.
  - Added the required column `usuario_id` to the `ConfirmacaoEmail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ConfirmacaoEmail" DROP COLUMN "email",
ADD COLUMN     "usuario_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ConfirmacaoEmail" ADD CONSTRAINT "ConfirmacaoEmail_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("idusuario") ON DELETE RESTRICT ON UPDATE CASCADE;
