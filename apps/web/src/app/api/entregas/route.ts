import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';

export async function GET(req: Request) {
  try {
    const token = (await cookies()).get('pgb_session')?.value;
    if (!token) {
      return NextResponse.json({ entregas: [], total: 0, page: 1 }, { status: 401 });
    }

    // Leia parâmetros do front
    const url = new URL(req.url);
    const dtInicial = url.searchParams.get('dtInicial') || '';
    const dtFinal = url.searchParams.get('dtFinal') || '';
    const pedido = url.searchParams.get('pedido') || '';
    const nf = url.searchParams.get('nf') || '';
    const page = Number(url.searchParams.get('page') || '1');
    const pageSize = Number(url.searchParams.get('pageSize') || '10');

    // TODO: quando existir /dashboard/entregas no backend, proxiar:
    const qs = new URLSearchParams({ dtInicial, dtFinal, pedido, nf, page: String(page), pageSize: String(pageSize) });
    const res = await fetch(`${API_BASE}/dashboard/entregas?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
    });
    if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return NextResponse.json({ error: err?.error || `Falha backend (${res.status})` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);

    return NextResponse.json({ entregas: [], total: 0, page, pageSize }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Erro inesperado' }, { status: 500 });
  }
}