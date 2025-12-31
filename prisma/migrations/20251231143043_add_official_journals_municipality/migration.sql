-- CreateTable
CREATE TABLE "OfficialJournalMunicipality" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "dia" DATE NOT NULL,
    "arquivo" TEXT NOT NULL,
    "descricao" TEXT,
    "codigo_dia" TEXT NOT NULL,
    "source_site" TEXT NOT NULL DEFAULT 'diogrande',
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficialJournalMunicipality_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "official_journals_dia_idx" ON "OfficialJournalMunicipality"("dia");

-- CreateIndex
CREATE INDEX "official_journals_numero_idx" ON "OfficialJournalMunicipality"("numero");

-- CreateIndex
CREATE INDEX "official_journals_codigo_idx" ON "OfficialJournalMunicipality"("codigo_dia");

-- CreateIndex
CREATE INDEX "official_journals_user_idx" ON "OfficialJournalMunicipality"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "official_journals_user_uniq" ON "OfficialJournalMunicipality"("user_id", "codigo_dia", "arquivo");

-- AddForeignKey
ALTER TABLE "OfficialJournalMunicipality" ADD CONSTRAINT "OfficialJournalMunicipality_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
