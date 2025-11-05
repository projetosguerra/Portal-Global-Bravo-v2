import Fastify from 'fastify';
import cors from '@fastify/cors';

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true, // ajuste depois para a URL do seu front
});

app.get('/health', async () => ({ ok: true }));

const port = Number(process.env.PORT ?? 4001);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  app.log.info(`API running on ${port}`);
});