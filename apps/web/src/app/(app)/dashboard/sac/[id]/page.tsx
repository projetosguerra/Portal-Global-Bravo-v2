import { Card, Badge, Button } from '@pgb/ui';
import Link from 'next/link';
import { fetchTicketDetail } from '../detailApi';

function statusBadge(s: 'pendente' | 'em_andamento' | 'finalizado') {
  if (s === 'finalizado') return <Badge variant="success">Finalizado</Badge>;
  if (s === 'em_andamento') return <Badge variant="info">Em andamento</Badge>;
  return <Badge variant="warning">Pendente</Badge>;
}

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const res = await fetchTicketDetail(params.id);
  if (!res.ok) {
    return (
      <Card className="p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Ticket</h1>
        <p className="text-sm text-red-600">{res.message || 'Falha ao carregar o ticket'}</p>
        <div className="mt-4">
          <Link href="/dashboard/sac">
            <Button variant="secondary">Voltar</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const { ticket, timeline } = res;
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ticket #{ticket.id}</h1>
          <p className="text-sm text-slate-600">
            Abertura: {new Date(ticket.openedAt).toLocaleString('pt-BR')}
            {' · '}
            Status: {statusBadge(ticket.status)}
          </p>
        </div>
        <Link href="/dashboard/sac">
          <Button variant="secondary">Voltar</Button>
        </Link>
      </div>

      <Card className="p-4 sm:p-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Assunto</div>
            <div className="text-sm">{ticket.subject || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Origem</div>
            <div className="text-sm">{ticket.origin || '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Pedido</div>
            <div className="text-sm">{ticket.orderNumber ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Nota Fiscal</div>
            <div className="text-sm">{ticket.invoiceNumber ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Filial</div>
            <div className="text-sm">{ticket.branch ?? '—'}</div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Finalização</div>
            <div className="text-sm">
              {ticket.closedAt ? new Date(ticket.closedAt).toLocaleString('pt-BR') : '—'}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-900">Histórico</h2>
        {timeline.length === 0 ? (
          <p className="text-sm text-slate-600 mt-2">Sem movimentações</p>
        ) : (
          <div className="mt-4 space-y-4">
            {timeline.map((item: any) => (
              <div key={item.seq} className="flex items-start gap-3">
                <div className="mt-1">
                  {statusBadge(item.status)}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-slate-500">
                    {new Date(item.when).toLocaleString('pt-BR')}
                  </div>
                  <div className="text-sm text-gray-800">{item.description || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}