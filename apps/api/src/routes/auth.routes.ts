import type { FastifyInstance } from 'fastify';
import { login } from '../controllers/authController';

export default async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (req, reply) => {
    const body = (req.body ?? {}) as { email?: string; password?: string };
    if (!body.email || !body.password) {
      return reply.code(400).send({ message: 'email e password são obrigatórios' });
    }
    const res = await login(body.email, body.password);
    if (!res.ok) return reply.code(res.status).send({ message: res.message });
    return reply.send(res.session);
  });

  app.post('/register', async (_req, reply) => {
    return reply.code(503).send({ message: 'Cadastro indisponível neste ambiente' });
  });
}