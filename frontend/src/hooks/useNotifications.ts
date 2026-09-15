import { useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '../types';
import { notificationApi } from '../api/doctorApi';
import { useSocket } from '../context/SocketContext';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string; type?: string } | null>(null);
  const { socket } = useSocket();

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationApi.getMy();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch {
      // Ignored if unauthenticated
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time listener for newly created notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (payload: any) => {
      const newNotif: NotificationItem = {
        id: payload.id || String(Date.now()),
        recipientType: 'PATIENT',
        title: payload.title,
        message: payload.message,
        channel: payload.channel || 'IN_APP',
        isRead: false,
        eventType: payload.eventType || 'INFO',
        createdAt: payload.timestamp || new Date().toISOString(),
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((c) => c + 1);
      setToastMessage({ title: payload.title, message: payload.message });

      // Auto dismiss toast after 6s
      setTimeout(() => {
        setToastMessage(null);
      }, 6000);
    };

    socket.on('notification.created', handleNewNotification);

    return () => {
      socket.off('notification.created', handleNewNotification);
    };
  }, [socket]);

  const markAsRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return {
    notifications,
    unreadCount,
    toastMessage,
    dismissToast: () => setToastMessage(null),
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
