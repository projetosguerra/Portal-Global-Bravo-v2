import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';

export type SACDataset = {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  tension?: number;
  fill?: boolean;
};

export type SACSeries = { labels: string[]; datasets: SACDataset[] };

export async function fetchSacSeries(): Promise<SACSeries> {
  const token = (await cookies()).get('pgb_session')?.value;
  if (!token) throw new Error('Sem token de sessão');
  const res = await fetch(`${API_BASE}/dashboard/sac/series`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Falha ao buscar séries do SAC (${res.status})`);
  }
  return res.json();
}