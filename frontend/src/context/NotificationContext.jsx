import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize WebSocket connection
      const newSocket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:8080', {
        auth: {
          token: localStorage.getItem('token'),
        },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to notification service');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from notification service');
      });

      newSocket.on('notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast notification
        switch (notification.type) {
          case 'ANALYSIS_COMPLETE':
            toast.success('Code analysis completed!');
            break;
          case 'REPORT_READY':
            toast.success('Report is ready for download');
            break;
          case 'ANALYSIS_FAILED':
            toast.error('Code analysis failed');
            break;
          default:
            toast(notification.message);
        }
      });

      newSocket.on('analysis_progress', (progress) => {
        // Handle real-time analysis progress updates
        console.log('Analysis progress:', progress);
      });

      newSocket.on('error', (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error occurred');
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const sendMessage = (event, data) => {
    if (socket && socket.connected) {
      socket.emit(event, data);
    }
  };

  const value = {
    socket,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    sendMessage,
    isConnected: socket?.connected || false,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};