import { getConnection } from '../db/pool';
import { select } from '../db/query';
import { OWNER } from '../utils/env';

export type SACSeriesDTO = {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        tension?: number;
        fill?: boolean;
    }>;
};

function empty24(): number[] {
    return Array.from({ length: 24 }, () => 0);
}

export function hourIdx(d: any): number {
    const dt = new Date(d);
    const h = dt.getHours();
    return Math.max(0, Math.min(23, h));
}

export function classify(row: any): 'resolved' | 'in_progress' | 'pending' {
    const status = String(row.STATUS ?? '').trim().toLowerCase();
    const finalized = row.DTFINALIZA != null;
    if (finalized) return 'resolved';
    if (['em andamento', 'andamento', 'aguardando'].includes(status)) return 'in_progress';
    if (['aberto', 'inicial'].includes(status)) return 'pending';
    // fallback
    return 'in_progress';
}

export async function getSACSeries(params: { codcli: number }): Promise<SACSeriesDTO> {
    // hoje, tickets principais
    const rows = await select<any>(
        `
    SELECT
      BRSACC.DTABERTURA,
      BRSACC.DTFINALIZA,
      BRSACC.STATUS
    FROM ${OWNER}.BRSACC
    WHERE BRSACC.NUMTICKET = BRSACC.NUMTICKETPRINC
      AND NVL(BRSACC.STATUS,'') <> 'Cancelado'
      AND TRUNC(BRSACC.DTABERTURA) = TRUNC(SYSDATE)
      AND BRSACC.CODCLI = :CODCLI
    `,
        { CODCLI: params.codcli }
    );

    const resolved = empty24();
    const inProgress = empty24();
    const pending = empty24();

    for (const r of rows) {
        const idx = hourIdx(r.DTABERTURA);
        const cls = classify(r);
        if (cls === 'resolved') resolved[idx] += 1;
        else if (cls === 'in_progress') inProgress[idx] += 1;
        else pending[idx] += 1;
    }

    const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    return {
        labels,
        datasets: [
            {
                label: 'Resolvidos',
                data: resolved,
                borderColor: '#4a90e2',
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                tension: 0.3,
                fill: true,
            },
            {
                label: 'Em andamento',
                data: inProgress,
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                tension: 0.3,
                fill: true,
            },
            {
                label: 'Pendentes',
                data: pending,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                tension: 0.3,
                fill: true,
            },
        ],
    };
}

// ---------- Criação de ticket (INSERT em BRSACC) ----------

async function tryNextvalSequence(conn: any, seqName: string): Promise<number | null> {
    try {
        const sql = `SELECT ${OWNER}.${seqName}.NEXTVAL AS VAL FROM DUAL`;
        const r = await conn.execute(sql);
        const val = (r?.rows?.[0] as any)?.VAL ?? (r?.rows?.[0] as any)?.[0];
        if (val != null) return Number(val);
    } catch (_) { /* sequência não existe */ }
    return null;
}

async function getNextTicketNumber(conn: any): Promise<number> {
    // Tentativas de sequences comuns
    const candidates = ['SEQ_BRSACC', 'BRSACC_SEQ', 'SEQ_TICKET', 'SEQ_BRSACC_TICKET'];
    for (const s of candidates) {
        const v = await tryNextvalSequence(conn, s);
        if (v != null) return v;
    }
    // Fallback frágil (homologação): MAX + 1
    const r = await conn.execute(`SELECT NVL(MAX(NUMTICKET),0) + 1 AS NX FROM ${OWNER}.BRSACC`);
    const nx = (r?.rows?.[0] as any)?.NX ?? (r?.rows?.[0] as any)?.[0] ?? 1;
    return Number(nx);
}

export type CreateTicketInput = {
    codcli: number;
    subject: string;
    orderNumber?: string | number;
    invoiceNumber?: string | number;
    codfilial?: string; // default '1'
};

export type CreateTicketResult = {
    numTicket: number;
    openDate: string;
    status: string;
};

export async function createTicket(input: CreateTicketInput): Promise<CreateTicketResult> {
    const conn = await getConnection();
    try {
        const numTicket = await getNextTicketNumber(conn);
        const binds = {
            NUMTICKET: numTicket,
            CODCLI: Number(input.codcli),
            CODFILIAL: (input.codfilial ?? '1'),
            NUMPED: input.orderNumber ? Number(input.orderNumber) : null,
            NUMNOTA: input.invoiceNumber ? Number(input.invoiceNumber) : null,
            RELATOCLIENTE: String(input.subject ?? '').slice(0, 4000),
        };

        await conn.execute(
            `
      INSERT INTO ${OWNER}.BRSACC
        (NUMTICKET, NUMTICKETPRINC, NUMSEQ, DTABERTURA, CODFILIAL, CODCLI, NUMPED, NUMNOTA, RELATOCLIENTE, TIPO, STATUS)
      VALUES
        (:NUMTICKET, :NUMTICKET, 1, SYSDATE, :CODFILIAL, :CODCLI, :NUMPED, :NUMNOTA, :RELATOCLIENTE, 'I', 'Aberto')
      `,
            binds,
            { autoCommit: true } as any
        );

        const nowIso = new Date().toISOString();
        return { numTicket, openDate: nowIso, status: 'Aberto' };
    } finally {
        await conn.close();
    }
} 