import { useState, useEffect, useCallback } from 'react';
import { QueueStateSummary } from '../types';
import { queueApi } from '../api/queueApi';
import { useSocket } from '../context/SocketContext';

export function useLiveQueue(doctorId?: string) {
  const [queueSummary, setQueueSummary] = useState<QueueStateSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected, joinDoctorRoom } = useSocket();

  const fetchQueue = useCallback(async () => {
    if (!doctorId) return;
    try {
      const summary = await queueApi.getDoctorQueue(doctorId);
      setQueueSummary(summary);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch queue');
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    fetchQueue();
    if (doctorId) {
      joinDoctorRoom(doctorId);
    }
  }, [doctorId, fetchQueue, joinDoctorRoom]);

  // Real-time listener for queue updates
  useEffect(() => {
    if (!socket || !doctorId) return;

    const handleQueueUpdated = (data: QueueStateSummary) => {
      if (data.doctorId === doctorId) {
        setQueueSummary(data);
      }
    };

    socket.on('queue.updated', handleQueueUpdated);

    return () => {
      socket.off('queue.updated', handleQueueUpdated);
    };
  }, [socket, doctorId]);

  // Fallback REST polling every 12s if socket is disconnected
  useEffect(() => {
    if (isConnected || !doctorId) return;

    const interval = setInterval(() => {
      fetchQueue();
    }, 12000);

    return () => clearInterval(interval);
  }, [isConnected, doctorId, fetchQueue]);

  return {
    queueSummary,
    isLoading,
    error,
    refetch: fetchQueue,
  };
}
