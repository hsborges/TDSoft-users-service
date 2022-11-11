import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { middleware } from 'express-paginate';

export function searchRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get('/', middleware(10, 100), async (req, res) => {
    const { nome, page, limit } = req.query;

    const results = await prisma.user.findMany({
      select: { email: true, name: true, photo: true },
      where: { name: { contains: nome?.toString() } },
      take: parseInt(limit?.toString() || '10'),
      skip: (parseInt(page?.toString() || '1') - 1) * parseInt(limit?.toString() || '10'),
    });

    return res.json(results);
  });

  return router;
}
