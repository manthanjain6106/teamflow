'use client';

import { useState, useEffect } from 'react';

type NotificationCallback = (notification: any) => void;
type ConnectionCallback = (connected: boolean) => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private notificationCallbacks: NotificationCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];

  connect(userId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // In a real implementation, you would use wss:// for secure connection
      const wsUrl = `ws://localhost:3001/api/ws?userId=${userId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyConnectionCallbacks(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyNotificationCallbacks(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.notifyConnectionCallbacks(false);
        this.scheduleReconnect(userId);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.scheduleReconnect(userId);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect(userId: string) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(userId);
      }, delay);
    }
  }

  onNotification(callback: NotificationCallback) {
    this.notificationCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.notificationCallbacks.indexOf(callback);
      if (index > -1) {
        this.notificationCallbacks.splice(index, 1);
      }
    };
  }

  onConnectionChange(callback: ConnectionCallback) {
    this.connectionCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  private notifyNotificationCallbacks(notification: any) {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  private notifyConnectionCallbacks(connected: boolean) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
export const wsManager = new WebSocketManager();

// React hook for using WebSocket in components
export function useWebSocket(userId?: string) {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket
    wsManager.connect(userId);

    // Subscribe to connection changes
    const unsubscribeConnection = wsManager.onConnectionChange(setConnected);

    // Subscribe to notifications
    const unsubscribeNotifications = wsManager.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    });

    // Cleanup on unmount
    return () => {
      unsubscribeConnection();
      unsubscribeNotifications();
    };
  }, [userId]);

  return {
    connected,
    notifications,
    send: wsManager.send.bind(wsManager),
  };
}

// For non-React usage
export default wsManager;