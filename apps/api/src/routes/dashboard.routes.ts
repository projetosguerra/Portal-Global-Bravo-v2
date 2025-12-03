import type { FastifyInstance } from 'fastify';
import { getDashboardSummary, getDashboardKpis } from '../controllers/dashboardController';
import { verifyToken } from '../utils/token';
import { env } from '../utils/env';
import { getRecentOrders } from '../controllers/ordersController';
import { getDocsValidity } from '../controllers/docsController';
import { getSACSeries, createTicket } from '../controllers/sacController';

export default async function dashboardRoutes(app: FastifyInstance) {
  app.get('/summary', async (_req, reply) => {
    const data = await getDashboardSummary();
    return reply.send(data);
  });

  app.get('/kpis', async (req, reply) => {
    try {
      let tokenCodcli: number | undefined;
      const auth = req.headers.authorization;
      if (auth?.startsWith('Bearer ')) {
        const t = auth.slice(7);
        const v = verifyToken(t, env.JWT_SECRET);
        if (v.ok && v.payload?.codcli != null) tokenCodcli = Number(v.payload.codcli);
      }
      const q = req.query as { email?: string; codcli?: string | number };
      const effectiveCodcli = tokenCodcli ?? q?.codcli;
      const data = await getDashboardKpis({ email: q?.email, codcli: effectiveCodcli });
      return reply.send(data);
    } catch (err) {
      return reply.status(400).send({ error: (err as Error).message });
    }
  });

  app.get('/orders/recent', async (req, reply) => {
    try {
      const auth = req.headers.authorization;
      if (!auth?.startsWith('Bearer ')) return reply.status(401).send({ error: 'Token ausente' });
      const t = auth.slice(7);
      const v = verifyToken(t, env.JWT_SECRET);
      if (!v.ok) return reply.status(401).send({ error: v.error });
      const codcli = Number(v.payload?.codcli);
      if (!codcli) return reply.status(400).send({ error: 'CODCLI inválido no token' });
      const data = await getRecentOrders({ codcli });
      return reply.send({ orders: data });
    } catch (err) {
      return reply.status(400).send({ error: (err as Error).message });
    }
  });

  app.get('/docs/validity', async (req, reply) => {
    try {
      const auth = req.headers.authorization;
      if (!auth?.startsWith('Bearer ')) return reply.status(401).send({ error: 'Token ausente' });
      const t = auth.slice(7);
      const v = verifyToken(t, env.JWT_SECRET);
      if (!v.ok) return reply.status(401).send({ error: v.error });
      const codcli = Number(v.payload?.codcli);
      if (!codcli) return reply.status(400).send({ error: 'CODCLI inválido no token' });
      const docs = await getDocsValidity({ codcli });
      return reply.send({ docs });
    } catch (err) {
      return reply.status(400).send({ error: (err as Error).message });
    }
  });

  app.get('/sac/series', async (req, reply) => {
    try {
      const auth = req.headers.authorization;
      if (!auth?.startsWith('Bearer ')) return reply.status(401).send({ error: 'Token ausente' });
      const t = auth.slice(7);
      const v = verifyToken(t, env.JWT_SECRET);
      if (!v.ok) return reply.status(401).send({ error: v.error });
      const codcli = Number(v.payload?.codcli);
      if (!codcli) return reply.status(400).send({ error: 'CODCLI inválido no token' });
      const series = await getSACSeries({ codcli });
      return reply.send(series);
    } catch (err) {
      return reply.status(400).send({ error: (err as Error).message });
    }
  });

  app.post('/sac/tickets', async (req, reply) => {
    try {
      const auth = req.headers.authorization;
      if (!auth?.startsWith('Bearer ')) return reply.status(401).send({ error: 'Token ausente' });
      const t = auth.slice(7);
      const v = verifyToken(t, env.JWT_SECRET);
      if (!v.ok) return reply.status(401).send({ error: v.error });
      const codcli = Number(v.payload?.codcli);
      if (!codcli) return reply.status(400).send({ error: 'CODCLI inválido no token' });

      const body = (req.body ?? {}) as { subject?: string; orderNumber?: string | number; invoiceNumber?: string | number; codfilial?: string };
      if (!body.subject || !String(body.subject).trim()) {
        return reply.status(400).send({ error: 'Assunto (subject) é obrigatório' });
      }

      const created = await createTicket({
        codcli,
        subject: String(body.subject),
        orderNumber: body.orderNumber,
        invoiceNumber: body.invoiceNumber,
        codfilial: body.codfilial ?? '1',
      });

      return reply.send({ ok: true, ticket: created });
    } catch (err) {
      return reply.status(400).send({ error: (err as Error).message });
    }
  });
}