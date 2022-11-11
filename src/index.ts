import { PrismaClient } from '@prisma/client';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { json } from 'body-parser';

import swaggerUI from 'swagger-ui-express';
import yaml from 'yamljs';

import path from 'node:path';

import apiRouter from './routes';

import { v4 as publicIpV4 } from 'public-ip';
import { v4 as internalIpV4 } from 'internal-ip';

export async function cli() {
  const prisma = new PrismaClient();

  const ip = await (process.env.NODE_ENV === 'production' ? publicIpV4() : internalIpV4());
  const port = process.env.PORT || 3000;

  const swaggerDocument = {
    ...yaml.load(path.resolve(__dirname, '..', 'docs', 'jogo-da-memoria.yaml')),
    servers: [{ url: `http://${ip}:${port}/api` }],
  };

  const app = express();

  app.use(json());
  app.use(cors());
  app.use(helmet.hidePoweredBy());

  app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
  app.use('/api', apiRouter(prisma));

  app.get('/', (_, res) => res.redirect('/docs'));

  const server = app.listen(port, () => {
    console.log(`Service running on port ${port}`);
  });

  server.on('close', () => prisma.$disconnect());
}

if (require.main === module) cli();
