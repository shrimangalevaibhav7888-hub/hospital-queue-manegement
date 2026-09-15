import { useState, useEffect, useCallback } from 'react';
import { PatientQueueView } from '../types';
import { queueApi } from '../api/queueApi';
import { useSocket } from '../context/SocketContext';

export function usePatientQueue(patientId?: string) {
  const [patientView, setPatientView] = useState<PatientQueueView | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected, joinPatientRoom } = useSocket();

  const fetchActive = useCallback(async () => {
    if (!patientId) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await queueApi.getActiveVisitByPatient(patientId);
      setPatientView(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch active visit');
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchActive();
    if (patientId) {
      joinPatientRoom(patientId);
    }
  }, [patientId, fetchActive, joinPatientRoom]);

  // Real-time listener
  useEffect(() => {
    if (!socket || !patientId) return;

    const handlePatientUpdate = (data: PatientQueueView) => {
      setPatientView(data);
    };

    socket.on('queue.updated', handlePatientUpdate);

    return () => {
      socket.off('queue.updated', handlePatientUpdate);
    };
  }, [socket, patientId]);

  // Fallback polling if disconnected
  useEffect(() => {
    if (isConnected || !patientId) return;

    const interval = setInterval(() => {
      fetchActive();
    }, 12000);

    return () => clearInterval(interval);
  }, [isConnected, patientId, fetchActive]);

  return {
    patientView,
    isLoading,
    error,
    refetch: fetchActive,
  };
}
