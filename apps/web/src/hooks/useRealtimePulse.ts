import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../lib/auth-store';
import type { PulsePayload } from '../lib/types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000';

const useDemo = import.meta.env.VITE_USE_DEMO === 'true';

export function useRealtimePulse(enabled: boolean) {
  const token = useAuthStore((state) => state.token);
  const [pulse, setPulse] = useState<PulsePayload | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled || !token) {
      setConnected(false);
      setPulse(null);
      return;
    }

    if (useDemo) {
      setConnected(true);
      setPulse({
        at: new Date().toISOString(),
        metrics: []
      });
      return;
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token }
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));
    socket.on('launchops:pulse', (payload: PulsePayload) => setPulse(payload));

    return () => {
      socket.disconnect();
    };
  }, [enabled, token]);

  return { pulse, connected };
}
