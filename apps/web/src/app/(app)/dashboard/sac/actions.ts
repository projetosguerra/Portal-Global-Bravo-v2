'use server';

import { tickets as sdk } from '@pgb/sdk';

export async function searchTicketsAction(form: {
  dateFrom?: string;
  dateTo?: string;
  status?: 'todos' | 'em_andamento' | 'finalizado';
  orderNumber?: string;
  invoiceNumber?: string;
}) {
  try {
    const list = await sdk.searchTickets(form);
    return { ok: true, list };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Falha ao buscar tickets' };
  }
}

export async function createTicketAction(form: {
  subject: string;
  orderNumber?: string;
  invoiceNumber?: string;
}) {
  try {
    const t = await sdk.createTicket(form);
    return { ok: true, ticket: t };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'Falha ao criar ticket' };
  }
}