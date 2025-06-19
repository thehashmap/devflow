import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/notifications`,
  timeout: 10000,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const notificationService = {
  // Get all notifications with optional filter
  getNotifications: async (filter = 'all') => {
    const response = await apiClient.get('/', {
      params: { filter }
    });
    return response.data;
  },

  // Get notification by ID
  getNotification: async (id) => {
    const response = await apiClient.get(`/${id}`);
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id) => {
    const response = await apiClient.patch(`/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await apiClient.patch('/mark-all-read');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await apiClient.delete(`/${id}`);
    return response.data;
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await apiClient.get('/unread-count');
    return response.data.count;
  },

  // Create notification (admin only)
  createNotification: async (notificationData) => {
    const response = await apiClient.post('/', notificationData);
    return response.data;
  },

  // Update notification preferences
  updatePreferences: async (preferences) => {
    const response = await apiClient.patch('/preferences', preferences);
    return response.data;
  },

  // Get notification preferences
  getPreferences: async () => {
    const response = await apiClient.get('/preferences');
    return response.data;
  }
};

// WebSocket service for real-time notifications
export class NotificationWebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';

    this.socket = new WebSocket(`${wsUrl}/notifications?token=${token}`);

    this.socket.onopen = () => {
      console.log('Connected to notification WebSocket');
      this.emit('connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        this.emit('notification', notification);
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('Disconnected from notification WebSocket');
      this.emit('disconnected');

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (token) {
          this.connect(token);
        }
      }, 5000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in notification listener:', error);
        }
      });
    }
  }

  send(message) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }
}

// Singleton instance
export const notificationWS = new NotificationWebSocketService();