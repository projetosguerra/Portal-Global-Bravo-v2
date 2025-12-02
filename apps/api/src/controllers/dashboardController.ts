import { select } from '../db/query';
import { OWNER } from '../utils/env';

export type DashboardSummary = {
  usuarios_total: number;
  usuarios_clientes: number;
  usuarios_outros: number;
  nf_total_hoje: number;
  nf_erros_hoje: number;
  nf_sucesso_hoje: number;
  nf_ultimos7d: number;
  atualizado_em: string;
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [u] = await select<{ TOTAL: number; CLIENTES: number }>(
    `
    SELECT
      COUNT(*) AS TOTAL,
      SUM(CASE WHEN UPPER(TRIM(TIPO)) = 'C' THEN 1 ELSE 0 END) AS CLIENTES
    FROM ${OWNER}.BRLOGINWEB
    `
  );
  const usuarios_total = u?.TOTAL ?? 0;
  const usuarios_clientes = u?.CLIENTES ?? 0;
  const usuarios_outros = usuarios_total - usuarios_clientes;

  let nf_total_hoje = 0;
  let nf_erros_hoje = 0;
  let nf_sucesso_hoje = 0;
  let nf_ultimos7d = 0;

  try {
    const [n] = await select<{
      TOTAL_HOJE: number;
      ERROS_HOJE: number;
      SUCESSO_HOJE: number;
      ULT7D: number;
    }>(
      `
      SELECT
        SUM(CASE WHEN TRUNC(NVL(DATAPROCESSAMENTO, DATAATUALIZACAO)) = TRUNC(SYSDATE) THEN 1 ELSE 0 END) AS TOTAL_HOJE,
        SUM(CASE WHEN TRUNC(NVL(DATAPROCESSAMENTO, DATAATUALIZACAO)) = TRUNC(SYSDATE)
                  AND (NVL(ERROINTEGRACAO,0) <> 0 OR NVL(ERROORACLECODE,0) <> 0)
            THEN 1 ELSE 0 END) AS ERROS_HOJE,
        SUM(CASE WHEN TRUNC(NVL(DATAPROCESSAMENTO, DATAATUALIZACAO)) = TRUNC(SYSDATE)
                  AND (NVL(ERROINTEGRACAO,0) = 0 AND NVL(ERROORACLECODE,0) = 0)
            THEN 1 ELSE 0 END) AS SUCESSO_HOJE,
        SUM(CASE WHEN NVL(DATAPROCESSAMENTO, DATAATUALIZACAO) >= TRUNC(SYSDATE) - 6 THEN 1 ELSE 0 END) AS ULT7D
      FROM ${OWNER}.BRLOGNFENTI
      `
    );

    nf_total_hoje = n?.TOTAL_HOJE ?? 0;
    nf_erros_hoje = n?.ERROS_HOJE ?? 0;
    nf_sucesso_hoje = n?.SUCESSO_HOJE ?? 0;
    nf_ultimos7d = n?.ULT7D ?? 0;
  } catch (e) {
    console.error('BRLOGNFENTI summary failed:', e);
  }

  return {
    usuarios_total,
    usuarios_clientes,
    usuarios_outros,
    nf_total_hoje,
    nf_erros_hoje,
    nf_sucesso_hoje,
    nf_ultimos7d,
    atualizado_em: new Date().toISOString(),
  };
}