import { useEffect, useState, useRef } from 'react';
import type { PVC } from '@shared/schema';
import { apiService } from '@/services/apiService';

export function useRealTimeUpdates() {
  const [pvcs, setPvcs] = useState<PVC[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const connect = () => {
    try {
      setError(null);
      
      // Start real-time updates (either mock or WebSocket)
      const cleanup = apiService.onPVCUpdates((updatedPvcs) => {
        setPvcs(updatedPvcs);
        setConnected(true);
      });
      
      cleanupRef.current = cleanup;
      
      console.log(`Real-time updates started (${apiService.isMockMode() ? 'mock' : 'WebSocket'} mode)`);
      
    } catch (err) {
      console.error('Failed to start real-time updates:', err);
      setError('Failed to establish real-time connection');
      setConnected(false);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return {
    pvcs,
    connected,
    error,
    reconnect: connect,
    isMockMode: apiService.isMockMode()
  };
}