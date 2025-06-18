-- CreateTable
CREATE TABLE "Source" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSource" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Source_nome_key" ON "Source"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "UserSource_sourceId_userId_key" ON "UserSource"("sourceId", "userId");

-- AddForeignKey
ALTER TABLE "UserSource" ADD CONSTRAINT "UserSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSource" ADD CONSTRAINT "UserSource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
