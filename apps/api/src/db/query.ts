import * as oracledb from 'oracledb';
import { getConnection } from './pool';

type Binds = Record<string, unknown> | unknown[];

// Local interfaces/types for stronger typing while keeping runtime intact
export interface SelectOptions extends oracledb.ExecuteOptions {}

export type ExecuteResult<T> = { rows?: T[] };

const isSelectOnly = (sql: string): boolean => {
  const s = sql.trim().toUpperCase();
  return s.startsWith('SELECT ') || s.startsWith('WITH ');
};

export async function select<T = any>(
  sql: string,
  binds?: Binds,
  options?: oracledb.ExecuteOptions
): Promise<T[]> {
  if (!isSelectOnly(sql)) {
    throw new Error('Only SELECT/CTE statements are allowed in production API');
  }
  const conn = await getConnection();
  try {
    const result: ExecuteResult<T> = await conn.execute<T>(sql, binds ?? {}, {
      outFormat: (options?.outFormat ?? (oracledb as any).OUT_FORMAT_OBJECT),
      maxRows: options?.maxRows ?? 1000,
      fetchArraySize: options?.fetchArraySize ?? 100,
      ...options,
    });
    return result.rows ?? [];
  } finally {
    await conn.close();
  }
}