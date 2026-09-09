import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const board = await prisma.board.upsert({
    where: { slug: 'study' },
    update: {},
    create: { slug: 'study', title: 'Учёба' },
  });

  const existing = await prisma.post.count({ where: { boardId: board.id } });
  if (existing === 0) {
    await prisma.post.createMany({
      data: [
        {
          boardId: board.id,
          title: 'Дедлайн по лабе',
          body: 'Кто сдаёт до пятницы? Можно скинуть примеры отчёта.',
          authorHash: 'seed-demo',
        },
        {
          boardId: board.id,
          title: 'Конспект по Discrete Math',
          body: 'Ищу конспект лекций за прошлую неделю, готов обменяться.',
          authorHash: 'seed-demo',
        },
      ],
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
