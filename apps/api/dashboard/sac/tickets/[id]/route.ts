import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://26.219.165.89:4001';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('pgb_session')?.value;
    if (!token) return NextResponse.json({ error: 'Sem sessão' }, { status: 401 });

    const res = await fetch(`${API_BASE}/dashboard/sac/tickets/${encodeURIComponent(params.id)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro inesperado' }, { status: 500 });
  }
}