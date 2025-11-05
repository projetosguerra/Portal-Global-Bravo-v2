import Fastify from 'fastify';
import cors from '@fastify/cors';
import healthRoutes from './routes/health.routes';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, { origin: true });

  app.register(healthRoutes, { prefix: '/' });

  app.setErrorHandler((err, _req, reply) => {
    app.log.error({ err }, 'Unhandled error');
    reply.code(500).send({ message: 'Internal error' });
  });

  return app;
}