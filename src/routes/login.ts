import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { requireParameters } from '../middlewares/parameters';
import { StatusCodes } from 'http-status-codes';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export function loginRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.post('/', requireParameters({ body: ['email', 'password'] }), async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email }, include: { roles: true } });

    if (user) {
      const isSame = bcrypt.compareSync(password, user.password);

      if (isSame) {
        const token = jwt.sign(
          { email: user.email, name: user.name, roles: user.roles.map((userRole) => userRole.role) },
          'tdsoft.2022.2',
          { expiresIn: '24 hours' }
        );

        return res.json({ token });
      }
    }

    return res.sendStatus(StatusCodes.NOT_FOUND);
  });

  return router;
}
