import { useState, useEffect } from 'react';
import { notificationsApi } from '@/lib/api';
import { Notification } from '@/types';
import { io, Socket } from 'socket.io-client';

interface NotificationData {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export const useNotifications = () => {
  const [data, setData] = useState<NotificationData>({
    notifications: [],
    unreadCount: 0,
    loading: true,
    error: null
  });
  
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchNotifications = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await notificationsApi.getNotifications();
      const notifications = response.data.notifications || response.data || [];
      const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
      
      setData({
        notifications,
        unreadCount,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load notifications'
      }));
    }
  };

  

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setData(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      setData(prev => {
        const notification = prev.notifications.find(n => (n.id || n._id) === notificationId);
        const wasUnread = notification && !notification.isRead;
        
        return {
          ...prev,
          notifications: prev.notifications.filter(n => (n.id || n._id) !== notificationId),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount
        };
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Initialize WebSocket connection for real-time notifications
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user._id;
    
    if (!userId) {
      console.log('❌ No user ID found, skipping WebSocket connection');
      return;
    }

    console.log('🔌 Connecting to notifications for user:', userId);

    // Create socket connection
    const newSocket = io('http://localhost:3001/notifications', {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to notification server');
      // Join user-specific notification room
      newSocket.emit('joinNotifications', { userId });
    });

    newSocket.on('newNotification', (notification: Notification) => {
      console.log('🔔 New notification received:', notification.title);
      
      // Add new notification to the list
      setData(prev => ({
        ...prev,
        notifications: [notification, ...prev.notifications],
        unreadCount: prev.unreadCount + 1
      }));
      
      // Show browser notification if permission granted
      if (typeof window !== 'undefined' && window.Notification && window.Notification.permission === 'granted') {
        new window.Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from notification server');
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit('leaveNotifications', { userId });
        newSocket.disconnect();
      }
    };
  }, []);

  // Fetch notifications on mount and listen for refresh events
  useEffect(() => {
    fetchNotifications();
    
    // Request browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification.permission === 'default') {
      window.Notification.requestPermission();
    }
    
    // Listen for notification refresh events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notificationRefresh') {
        fetchNotifications();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    ...data,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
