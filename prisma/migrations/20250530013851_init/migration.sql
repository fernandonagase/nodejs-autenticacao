-- CreateTable
CREATE TABLE "User" (
    "idusuario" SERIAL NOT NULL,
    "nomeusuario" TEXT NOT NULL,
    "nome" VARCHAR(50) NOT NULL,
    "senha" VARCHAR(100) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alterado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("idusuario")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nomeusuario_key" ON "User"("nomeusuario");
