import Fastify from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketIO } from './rooms.js';

const server = Fastify({ logger: true });

server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const io = new SocketIOServer(server.server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSocketIO(io);

const port = Number(process.env.PORT || 4001);

server.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Thayam Game Server listening on port ${port}`);
});
