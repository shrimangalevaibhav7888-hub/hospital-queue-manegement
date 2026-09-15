import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { playChime } from '../utils/sound';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isReconnecting: boolean;
  joinDoctorRoom: (doctorId: string) => void;
  joinPatientRoom: (patientId: string) => void;
  joinQueueRoom: (queueId: string) => void;
  joinPublicRoom: () => void;
  joinAdminRoom: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  useEffect(() => {
    // Connect to backend Socket.IO gateway
    const socketInstance = io(window.location.origin.includes(':5173') ? 'http://localhost:5000' : '/', {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to server:', socketInstance.id);
      setIsConnected(true);
      setIsReconnecting(false);

      // Automatically join personal user room
      if (user?.id) {
        socketInstance.emit('join:user', user.id);
      }
      if (user?.patientId) {
        socketInstance.emit('join:patient', user.patientId);
      }
      if (user?.doctorId) {
        socketInstance.emit('join:doctor', user.doctorId);
      }
      if (user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST') {
        socketInstance.emit('join:admin');
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
      setIsConnected(false);
      setIsReconnecting(true);
    });

    socketInstance.on('reconnect', () => {
      console.log('[Socket] Reconnected successfully');
      setIsConnected(true);
      setIsReconnecting(false);
    });

    socketInstance.on('queue.patient_called', () => {
      playChime('call');
    });

    socketInstance.on('notification.created', () => {
      playChime('notification');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id, user?.patientId, user?.doctorId, user?.role]);

  const joinDoctorRoom = useCallback(
    (doctorId: string) => {
      if (socket && isConnected) {
        socket.emit('join:doctor', doctorId);
      }
    },
    [socket, isConnected]
  );

  const joinPatientRoom = useCallback(
    (patientId: string) => {
      if (socket && isConnected) {
        socket.emit('join:patient', patientId);
      }
    },
    [socket, isConnected]
  );

  const joinQueueRoom = useCallback(
    (queueId: string) => {
      if (socket && isConnected) {
        socket.emit('join:queue', queueId);
      }
    },
    [socket, isConnected]
  );

  const joinPublicRoom = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('join:public');
    }
  }, [socket, isConnected]);

  const joinAdminRoom = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('join:admin');
    }
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        isReconnecting,
        joinDoctorRoom,
        joinPatientRoom,
        joinQueueRoom,
        joinPublicRoom,
        joinAdminRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within a SocketProvider');
  return context;
};
