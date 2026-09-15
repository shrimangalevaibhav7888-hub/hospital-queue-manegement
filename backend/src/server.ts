import http from 'http';
import app from './app';
import { env } from './config/env';
import { initializeSocketServer } from './websocket/socketServer';
import { logger } from './utils/logger';

const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocketServer(server);

server.listen(env.PORT, () => {
  logger.info(`=======================================================`);
  logger.info(` CareFlow Hospital Queue System Backend`);
  logger.info(` Server running on: http://localhost:${env.PORT}`);
  logger.info(` Real-time WebSocket Gateway active on port ${env.PORT}`);
  logger.info(` Environment: ${env.NODE_ENV}`);
  logger.info(`=======================================================`);
});

export { server, io };
