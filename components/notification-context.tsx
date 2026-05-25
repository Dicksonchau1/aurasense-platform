
"use client";
import React from 'react';
import { createContext, useContext, useState } from 'react';

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface NotificationContextType {
  notification: Notification | null;
  showNotification: (n: Notification) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);

  function showNotification(notification: Notification) {
    setNotification(notification);
    setTimeout(() => setNotification(null), 4000);
  }
  function clearNotification() {
    setNotification(null);
  }

  return (
    <NotificationContext.Provider value={{ notification, showNotification, clearNotification }}>
      {children}
      {notification && (
        <div className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition bg-${notification.type === 'success' ? '[#4ade80]' : notification.type === 'error' ? '[#f87171]' : '[#1fb6a6]'} animate-fade-in-out`}>
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
}
