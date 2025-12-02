import { select } from '../db/query';
import { signToken } from '../utils/token';
import { env } from '../utils/env';

type DbUser = {
  EMAIL: string;
  SENHA: string;
  CGC?: string | null;
  TIPO?: string | null;
  NOME?: string | null;
};

const OWNER = (process.env.ORACLE_OWNER || process.env.ORACLE_USER || '').toUpperCase();

export async function login(email: string, password: string) {
  const rows = await select<DbUser>(
    `
    SELECT EMAIL, SENHA, CGC, TIPO, NOME
    FROM ${OWNER}.BRLOGINWEB
    WHERE UPPER(TRIM(EMAIL)) = UPPER(TRIM(:email))
    FETCH FIRST 1 ROWS ONLY
    `,
    { email }
  );

  const user = rows[0];
  if (!user) return { ok: false, status: 401, message: 'Usuário não encontrado' as const };
  const ok = (password ?? '') === (user.SENHA ?? '').trim();
  if (!ok) return { ok: false, status: 401, message: 'Senha inválida' as const };

  const token = signToken({ sub: user.EMAIL }, env.JWT_SECRET);
  return {
    ok: true,
    status: 200,
    session: {
      token,
      user: {
        email: user.EMAIL,
        name: user.NOME ?? '',
        cgc: user.CGC ?? '',
        tipo: user.TIPO ?? '',
      },
    },
  };
}