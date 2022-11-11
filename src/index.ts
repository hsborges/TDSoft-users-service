import { PrismaClient } from '@prisma/client';

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { json } from 'body-parser';

import swaggerUI from 'swagger-ui-express';
import yaml from 'yamljs';

import path from 'node:path';

import apiRouter from './routes';

export async function cli() {
  const prisma = new PrismaClient();

  const swaggerDocument = yaml.load(path.resolve(__dirname, '..', 'docs', 'jogo-da-memoria.yaml'));

  const app = express();

  app.use(json());
  app.use(cors());
  app.use(helmet.hidePoweredBy());

  app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
  app.use('/api', apiRouter(prisma));

  app.get('/', (_, res) => res.redirect('/docs'));

  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => {
    console.log(`Service running on port ${port}`);
  });

  server.on('close', () => prisma.$disconnect());
}

if (require.main === module) cli();
