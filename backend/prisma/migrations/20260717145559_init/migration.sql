-- CreateEnum
CREATE TYPE "NivelAcesso" AS ENUM ('ADMIN', 'COMUM');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "nivel_acesso" "NivelAcesso" NOT NULL DEFAULT 'COMUM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "times" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "cidade" VARCHAR(100),
    "tecnico" VARCHAR(100),

    CONSTRAINT "times_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jogos" (
    "id" SERIAL NOT NULL,
    "data_hora" TIMESTAMP(3),
    "time_casa_id" INTEGER NOT NULL,
    "time_visitante_id" INTEGER NOT NULL,
    "gols_casa" INTEGER NOT NULL DEFAULT 0,
    "gols_visitante" INTEGER NOT NULL DEFAULT 0,
    "estadio" VARCHAR(100),

    CONSTRAINT "jogos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- AddForeignKey
ALTER TABLE "jogos" ADD CONSTRAINT "jogos_time_casa_id_fkey" FOREIGN KEY ("time_casa_id") REFERENCES "times"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos" ADD CONSTRAINT "jogos_time_visitante_id_fkey" FOREIGN KEY ("time_visitante_id") REFERENCES "times"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
