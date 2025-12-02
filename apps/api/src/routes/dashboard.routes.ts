import type { FastifyInstance } from 'fastify';
import { getDashboardSummary } from '../controllers/dashboardController';

export default async function dashboardRoutes(app: FastifyInstance) {
  app.get('/summary', async (_req, reply) => {
    const data = await getDashboardSummary();
    return reply.send(data);
  });
}