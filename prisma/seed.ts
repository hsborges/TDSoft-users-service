import { PrismaClient } from '@prisma/client';

import data from './seed.json';

const prisma = new PrismaClient();

(async () => {
  for (const { email, firstname, lastname } of data) {
    await prisma.user.upsert({
      where: { email: email },
      create: {
        email: email,
        name: `${firstname} ${lastname}`,
        password: '12345',
        blocked: false,
        roles: {
          connectOrCreate: {
            where: { userEmail_role: { userEmail: email, role: 'USER' } },
            create: { role: 'USER' },
          },
        },
      },
      update: {},
    });
  }
})().finally(() => prisma.$disconnect());
