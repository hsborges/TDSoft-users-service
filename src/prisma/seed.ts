import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

import data from './seed.json';

const prisma = new PrismaClient();

(async () => {
  const salt = bcrypt.genSaltSync(2);

  data.push({ email: 'admin@gmail.com', firstname: 'Admin', lastname: 'Master' });

  for (const { email, firstname, lastname } of data) {
    await prisma.user.upsert({
      where: { email: email },
      create: {
        email: email,
        name: `${firstname} ${lastname}`,
        password: bcrypt.hashSync('12345', salt),
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
