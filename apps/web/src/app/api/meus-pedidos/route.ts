import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';

export async function GET() {
  try {
    const token = (await cookies()).get('pgb_session')?.value;
    if (!token) {
      return NextResponse.json({ pedidos: [], total: 0, page: 1 }, { status: 401 });
    }

    const res = await fetch(`${API_BASE}/dashboard/orders/recent`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err?.error || `Falha backend (${res.status})` }, { status: res.status });
    }

    const data = await res.json();
    const pedidos = (data?.orders ?? []).map((o: any, i: number) => ({
      id: o.orderNumber ?? String(i),
      nroPedido: o.orderNumber,
      nroNF: o.numNota ?? null,
      nroTransVenda: o.numTransVenda ?? null,
      posicao: o.status ?? null,
      data: o.date,
      filial: o.branch ?? '',
      codCliente: o.codcli ?? '',
      vendedor: o.seller,
      vlrTotal: o.total,
      vlrDesconto: o.desconto ?? 0,
      vlrFrete: o.frete ?? 0,
      nroItens: Array.isArray(o.itens) ? o.itens.length : undefined,
      itens: o.itens ?? [],
    }));

    return NextResponse.json({ pedidos, total: pedidos.length, page: 1 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Erro inesperado' }, { status: 500 });
  }
}