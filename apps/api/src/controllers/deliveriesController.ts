import { select } from '../db/query';
import { OWNER } from '../utils/env';

export type Delivery = {
  id: string;
  nroPedido: string;
  filial: string;
  nroNF?: string;
  vlrTotal: number;
  prevEntrega?: string;
  dtAgendamento?: string;
  dtEntrega?: string;
  transportadora?: string;
  status?: 'Entregue' | 'Agendado';
  rastreio?: string;
};

export async function searchDeliveries(params: {
  codcli: number;
  dateFrom?: string;
  dateTo?: string;
  nf?: string | number;
  page: number;
  pageSize: number;
}) {
  const binds: Record<string, any> = {
    CODCLI: params.codcli,
    DATE_FROM: params.dateFrom ?? null,
    DATE_TO: params.dateTo ?? null,
    NF: params.nf ?? null,
    OFFSET: (Math.max(1, params.page) - 1) * Math.max(1, Math.min(100, params.pageSize)),
    LIMIT: Math.max(1, Math.min(100, params.pageSize)),
  };

  // Seleciona colunas que sei que existe (evita ORA-00904)
  const rows = await select<any>(
    `
    SELECT
      n.NUMTRANSVENDA,
      n.NUMNOTA,
      n.VLTOTAL,
      n.CODCLI,
      n.DTFAT,
      a.DTENTREGA
    FROM ${OWNER}.BRAGENDANF a
    JOIN ${OWNER}.PCNFSAID n
      ON n.NUMTRANSVENDA = a.NUMTRANSVENDA
    WHERE n.CODCLI = :CODCLI
      AND (:NF IS NULL OR n.NUMNOTA = :NF)
      AND (:DATE_FROM IS NULL OR TRUNC(NVL(n.DTFAT, a.DTENTREGA)) >= TO_DATE(:DATE_FROM, 'YYYY-MM-DD'))
      AND (:DATE_TO   IS NULL OR TRUNC(NVL(n.DTFAT, a.DTENTREGA)) <= TO_DATE(:DATE_TO, 'YYYY-MM-DD'))
    ORDER BY NVL(a.DTENTREGA, n.DTFAT) DESC
    OFFSET :OFFSET ROWS FETCH NEXT :LIMIT ROWS ONLY
    `,
    binds
  );

  const countRows = await select<{ TOTAL: number }>(
    `
    SELECT COUNT(*) AS TOTAL
    FROM ${OWNER}.BRAGENDANF a
    JOIN ${OWNER}.PCNFSAID n
      ON n.NUMTRANSVENDA = a.NUMTRANSVENDA
    WHERE n.CODCLI = :CODCLI
      AND (:NF IS NULL OR n.NUMNOTA = :NF)
      AND (:DATE_FROM IS NULL OR TRUNC(NVL(n.DTFAT, a.DTENTREGA)) >= TO_DATE(:DATE_FROM, 'YYYY-MM-DD'))
      AND (:DATE_TO   IS NULL OR TRUNC(NVL(n.DTFAT, a.DTENTREGA)) <= TO_DATE(:DATE_TO, 'YYYY-MM-DD'))
    `,
    binds
  );
  const total = Number(countRows?.[0]?.TOTAL ?? 0);

  const mapped: Delivery[] = rows.map((r: any) => ({
    id: String(r.NUMTRANSVENDA),
    nroPedido: '-',         
    filial: '-',             
    nroNF: r.NUMNOTA ?? undefined,
    vlrTotal: Number(r.VLTOTAL ?? 0),
    dtEntrega: r.DTENTREGA ? new Date(r.DTENTREGA).toISOString() : undefined,
    status: r.DTENTREGA ? 'Entregue' : 'Agendado',
  }));

  return { list: mapped, total };
}