import { useState, useEffect, useCallback } from 'react';
import { useApiConnectionWithAuth } from '../services/api';
import { ApiService } from '../services/api';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export const useUserProfile = () => {
  const { isConnected, isAuthenticated } = useApiConnectionWithAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!isConnected || !isAuthenticated) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.getCurrentUser();
      if (response.data) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Errore nel caricamento del profilo utente');
    } finally {
      setLoading(false);
    }
  }, [isConnected, isAuthenticated]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const refreshProfile = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile
  };
};
