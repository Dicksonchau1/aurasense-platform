'use client';

import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from '@/components/notification-context';
import { AuthGate } from '@/components/auth-gate';
import { AppShell } from '@/components/app-shell';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <AuthGate>
          <AppShell>{children}</AppShell>
        </AuthGate>
      </NotificationProvider>
    </SessionProvider>
  );
}