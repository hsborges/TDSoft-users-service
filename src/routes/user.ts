import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { isNull, omitBy } from 'lodash';
import { requireParameters } from '../middlewares/parameters';
import bcrypt from 'bcrypt';
import { requireAuth } from '../middlewares/auth';
import { StatusCodes } from 'http-status-codes';
import { blockRouter } from './block';

export function userRouter(prisma: PrismaClient): Router {
  const router = Router();

  const salt = bcrypt.genSaltSync(2);

  router.use('/', blockRouter(prisma));

  router.get('/', requireParameters({ query: ['email'] }), async (req, res) => {
    const { email } = req.query;

    const user = await prisma.user.findUnique({
      select: { email: true, name: true, photo: true },
      where: { email: email?.toString() },
    });

    if (!user) return res.sendStatus(StatusCodes.NOT_FOUND);

    return res.status(StatusCodes.OK).json(omitBy(user, isNull));
  });

  router.post('/', requireParameters({ body: ['email', 'name', 'password'] }), async (req, res) => {
    const { email, name, password, photo } = req.body;

    const user = await prisma.user.findUnique({ where: { email: email } });

    if (user) return res.sendStatus(StatusCodes.CONFLICT);

    const result = await prisma.user.create({
      select: { email: true, name: true, photo: true },
      data: {
        email,
        name,
        password: bcrypt.hashSync(password, salt),
        photo,
        blocked: false,
        roles: {
          connectOrCreate: { where: { userEmail_role: { role: 'USER', userEmail: email } }, create: { role: 'USER' } },
        },
      },
    });

    res.status(StatusCodes.CREATED).json(omitBy(result, isNull));
  });

  router.delete('/', requireParameters({ query: ['email'] }), requireAuth(), async (req, res) => {
    if (req.locals.user === req.query.email) {
      await prisma.user.delete({ where: { email: req.query.email?.toString() } });
      return res.sendStatus(StatusCodes.OK);
    }

    return res.sendStatus(StatusCodes.UNAUTHORIZED);
  });

  router.put('/', requireParameters({ query: ['email'] }), requireAuth(), async (req, res) => {
    const { email } = req.query;
    const { name, password, photo } = req.body;

    if (req.locals.user === req.query.email) {
      const user = await prisma.user.findUnique({ where: { email: email?.toString() } });

      if (user) {
        if (name) user.name = name;
        if (password) user.password = bcrypt.hashSync(password, salt);
        if (photo) user.photo = photo;

        await prisma.user.update({ where: { email: email?.toString() }, data: user });
        return res.sendStatus(StatusCodes.OK);
      }

      return res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return res.sendStatus(StatusCodes.UNAUTHORIZED);
  });

  return router;
}
