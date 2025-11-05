import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('4001'),
  ORACLE_HOST: z.string(),
  ORACLE_PORT: z.string().default('1521'),
  ORACLE_SERVICE: z.string(),
  ORACLE_USER: z.string(),
  ORACLE_PASSWORD: z.string(),
  ORACLE_CURRENT_SCHEMA: z.string().optional(),
  DB_POOL_MIN: z.coerce.number().int().min(0).default(0),
  DB_POOL_MAX: z.coerce.number().int().min(1).default(4),
  DB_POOL_TIMEOUT_SEC: z.coerce.number().int().min(10).default(60),
});

const _env = envSchema.safeParse(process.env);
if (!_env.success) {
  console.error('Invalid environment variables:', _env.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = _env.data;

export const connectString = `${env.ORACLE_HOST}:${env.ORACLE_PORT}/${env.ORACLE_SERVICE}`;