import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';

const connectionString = process.env['DATABASE_URL'];
if (connectionString === undefined || connectionString.length === 0) {
  throw new Error('DATABASE_URL is not set');
}

/** Pool explícito: o driver `pg` emite `error` em falhas de clientes ociosos; sem listener o processo cai. */
const pool = new Pool({ connectionString });
pool.on('error', (err) => {
  console.error('[pg pool]', err);
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
