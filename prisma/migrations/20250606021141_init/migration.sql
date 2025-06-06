-- CreateTable
CREATE TABLE "ConfirmacaoEmail" (
    "id_token" UUID NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "expirado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfirmacaoEmail_pkey" PRIMARY KEY ("id_token")
);
