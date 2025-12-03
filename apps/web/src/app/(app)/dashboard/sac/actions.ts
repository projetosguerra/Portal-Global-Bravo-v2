'use server';

import { cookies } from 'next/headers';
import router from 'next/router';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';

export async function searchTicketsAction(_form: {
  dateFrom?: string;
  dateTo?: string;
  status?: 'todos' | 'em_andamento' | 'finalizado';
  orderNumber?: string;
  invoiceNumber?: string;
}) {
  // Placeholder: implementarei dps
  return { ok: true, list: [] as any[] };
}

export async function createTicketAction(form: {
  subject: string;
  orderNumber?: string;
  invoiceNumber?: string;
}) {
  try {
    const token = (await cookies()).get('pgb_session')?.value;
    if (!token) return { ok: false, message: 'Sem sessão' };

    const res = await fetch(`${API_BASE}/dashboard/sac/tickets`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        subject: form.subject,
        orderNumber: form.orderNumber || undefined,
        invoiceNumber: form.invoiceNumber || undefined,
      }),
      cache: 'no-store',
    });

    alert('Ticket criado com sucesso'); router.push('/dashboard/sac');

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, message: err?.error || `Falha ao criar ticket (${res.status})` };
    }

    const data = await res.json();
    return { ok: true, ticket: data?.ticket };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Erro inesperado ao criar ticket' };
  }
}