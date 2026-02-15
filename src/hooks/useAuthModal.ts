import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthModal = () => {
  const { user } = useAuth();

  const checkAuth = useCallback((callback: () => void) => {
    if (!user) {
      // Dispatch custom event to show auth modal
      window.dispatchEvent(new CustomEvent('showAuthModal'));
      return false;
    }
    callback();
    return true;
  }, [user]);

  return { checkAuth };
};