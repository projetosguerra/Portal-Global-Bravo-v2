import oracledb from 'oracledb'; // <- import em runtime
import { getConnection } from './pool';

type Binds = Record<string, unknown> | unknown[];

const isSelectOnly = (sql: string) => {
  const s = sql.trim().toUpperCase();
  return s.startsWith('SELECT ') || s.startsWith('WITH ');
};

export async function select<T = any>(sql: string, binds?: Binds, options?: oracledb.ExecuteOptions) {
  if (!isSelectOnly(sql)) {
    throw new Error('Only SELECT/CTE statements are allowed in production API');
  }
  const conn = await getConnection();
  try {
    const result = await conn.execute<T>(sql, binds ?? {}, {
      outFormat: options?.outFormat ?? oracledb.OUT_FORMAT_OBJECT,
      maxRows: options?.maxRows ?? 1000,
      fetchArraySize: options?.fetchArraySize ?? 100,
      ...options,
    });
    return result.rows ?? [];
  } finally {
    await conn.close();
  }
}