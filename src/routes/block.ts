import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { requireParameters } from '../middlewares/parameters';
import { StatusCodes } from 'http-status-codes';
import { requireAuth } from '../middlewares/auth';
import { requireRole } from '../middlewares/roles';

export function blockRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.post(
    '/block',
    requireParameters({ query: ['email'] }),
    requireAuth(),
    requireRole('ADMIN'),
    async (req, res) => {
      const count = await prisma.user.count({ where: { email: req.query.email?.toString() } });
      if (count === 0) return res.sendStatus(StatusCodes.NOT_FOUND);

      await prisma.user.update({ where: { email: req.query.email?.toString() }, data: { blocked: true } });
      return res.sendStatus(StatusCodes.OK);
    }
  );

  router.post(
    '/unblock',
    requireParameters({ query: ['email'] }),
    requireAuth(),
    requireRole('ADMIN'),
    async (req, res) => {
      const count = await prisma.user.count({ where: { email: req.query.email?.toString() } });
      if (count === 0) return res.sendStatus(StatusCodes.NOT_FOUND);

      await prisma.user.update({ where: { email: req.query.email?.toString() }, data: { blocked: false } });
      return res.sendStatus(StatusCodes.OK);
    }
  );

  return router;
}
