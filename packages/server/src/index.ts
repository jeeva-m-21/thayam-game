import Fastify from 'fastify';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setupSocketIO } from './rooms';

const server = Fastify({ logger: true });

server.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const httpServer = createServer(server.server);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSocketIO(io);

const port = Number(process.env.PORT || 4000);

httpServer.listen(port, '0.0.0.0', () => {
  server.log.info(`Thayam Game Server listening on port ${port}`);
});
