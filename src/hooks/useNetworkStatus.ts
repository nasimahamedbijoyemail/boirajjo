import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const useNetworkStatus = () => {
  const queryClient = useQueryClient();
  const wasOffline = useRef(false);

  useEffect(() => {
    const handleOffline = () => {
      wasOffline.current = true;
      toast.error('You are offline', {
        id: 'network-status',
        duration: Infinity,
        description: 'Check your internet connection. Changes will sync when you're back online.',
      });
    };

    const handleOnline = () => {
      if (wasOffline.current) {
        wasOffline.current = false;
        toast.success('Back online!', {
          id: 'network-status',
          duration: 3000,
          description: 'Syncing your data...',
        });
        // Auto-retry failed queries
        queryClient.invalidateQueries();
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Check initial state
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [queryClient]);
};
