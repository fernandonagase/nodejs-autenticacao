-- CreateTable
CREATE TABLE "TokenRefresh" (
    "id_tokenrefresh" UUID NOT NULL,
    "hash_token" BYTEA NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "expirado_em" TIMESTAMP(3) NOT NULL,
    "revogado_em" TIMESTAMP(3),

    CONSTRAINT "TokenRefresh_pkey" PRIMARY KEY ("id_tokenrefresh")
);

-- AddForeignKey
ALTER TABLE "TokenRefresh" ADD CONSTRAINT "TokenRefresh_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("idusuario") ON DELETE RESTRICT ON UPDATE CASCADE;
