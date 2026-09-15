import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { socketEmitter } from './socketEmitter';
import { logger } from '../utils/logger';

export function initializeSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  socketEmitter.setIO(io);

  io.on('connection', (socket: Socket) => {
    logger.debug(`[Socket] Client connected: ${socket.id}`);

    // Subscribe to doctor room
    socket.on('join:doctor', (doctorId: string) => {
      socket.join(`doctor:${doctorId}`);
      logger.debug(`[Socket] ${socket.id} joined room doctor:${doctorId}`);
    });

    // Subscribe to patient room
    socket.on('join:patient', (patientId: string) => {
      socket.join(`patient:${patientId}`);
      logger.debug(`[Socket] ${socket.id} joined room patient:${patientId}`);
    });

    // Subscribe to specific queue
    socket.on('join:queue', (queueId: string) => {
      socket.join(`queue:${queueId}`);
      logger.debug(`[Socket] ${socket.id} joined room queue:${queueId}`);
    });

    // Subscribe to user notification room
    socket.on('join:user', (userId: string) => {
      socket.join(`user:${userId}`);
      logger.debug(`[Socket] ${socket.id} joined room user:${userId}`);
    });

    // Subscribe to public TV display
    socket.on('join:public', () => {
      socket.join('hospital:public');
      logger.debug(`[Socket] ${socket.id} joined hospital:public`);
    });

    // Subscribe to admin/reception monitoring
    socket.on('join:admin', () => {
      socket.join('admin:monitoring');
      logger.debug(`[Socket] ${socket.id} joined admin:monitoring`);
    });

    socket.on('disconnect', () => {
      logger.debug(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
