import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.source.createMany({
    data: [
      { nome: 'doe' },
      { nome: 'diogrande' },
      { nome: 'exercito' }
    ],
    skipDuplicates: true
  });

  console.log("Fontes inseridas com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao rodar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
