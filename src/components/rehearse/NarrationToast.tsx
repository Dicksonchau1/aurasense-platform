'use client';

import React, { useEffect, useState } from 'react';
import type { SceneEvent } from '@/src/lib/rehearse/types';

interface NarrationToastProps {
  event: SceneEvent;
}

export default function NarrationToast({ event }: NarrationToastProps) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timer);
  }, [event.entity_id]);
  if (!visible) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        background: 'rgba(30,30,30,0.95)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: 8,
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        zIndex: 1000,
        fontSize: 16,
        maxWidth: 320,
        pointerEvents: 'none',
      }}
    >
      {event.payload?.message || 'Notification'}
    </div>
  );
}
