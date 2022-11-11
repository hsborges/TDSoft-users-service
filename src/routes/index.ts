import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { userRouter } from './user';
import { loginRouter } from './login';
import { blockRouter } from './block';
import { searchRouter } from './search';

export default function route(prisma: PrismaClient) {
  const router = Router();

  router.use('/user', userRouter(prisma));
  router.use('/login', loginRouter(prisma));
  router.use('/search', searchRouter(prisma));

  return router;
}
