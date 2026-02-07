import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [unreadDmCount, setUnreadDmCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const { user } = useAuth();

  // Fetch unread DM count
  const refetchDmCount = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await axios.get('http://localhost:5000/api/conversations/unread-count', {
        withCredentials: true,
      });
      setUnreadDmCount(data.count || 0);
    } catch (err) {
      console.error('Failed to refetch unread count:', err);
    }
  }, [user]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/api/notifications', {
        withCredentials: true,
      });
      setNotifications(data);
      
      // Count unread notifications
      const unreadCount = data.filter(n => !n.isRead).length;
      setUnreadNotificationCount(unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadNotificationCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await axios.put(
        'http://localhost:5000/api/notifications/mark-all-read',
        {},
        { withCredentials: true }
      );
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotificationCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/notifications/${notificationId}`,
        { withCredentials: true }
      );
      
      // Update local state
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [notifications]);

  // Initial fetch on mount or user change
  useEffect(() => {
    if (user) {
      refetchDmCount();
      fetchNotifications();
    } else {
      setUnreadDmCount(0);
      setNotifications([]);
      setUnreadNotificationCount(0);
    }
  }, [user, refetchDmCount, fetchNotifications]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewDmNotification = () => {
      refetchDmCount();
    };

    const handleNewNotification = (data) => {
      console.log('New notification received:', data);
      fetchNotifications();
    };

    socket.on('newDmNotification', handleNewDmNotification);
    socket.on('newNotification', handleNewNotification);

    return () => {
      socket.off('newDmNotification', handleNewDmNotification);
      socket.off('newNotification', handleNewNotification);
    };
  }, [socket, user, refetchDmCount, fetchNotifications]);

  const value = {
    unreadDmCount,
    notifications,
    unreadNotificationCount,
    loading,
    setUnreadDmCount,
    refetchDmCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    decreaseDmCount: (num) => setUnreadDmCount(prev => Math.max(0, prev - num)),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};