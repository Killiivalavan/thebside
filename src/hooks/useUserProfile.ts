import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthProvider';

type UserProfile = {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
} | null;

export const useUserProfile = (userId?: string) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      // Use provided userId or current user's ID
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) {
        setProfile(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('users')
          .select('id, username, bio, avatar_url, created_at')
          .eq('id', targetUserId)
          .single();

        if (fetchError) {
          console.error('Error fetching user profile:', fetchError);
          setError(fetchError.message);
          setProfile(null);
          return;
        }

        setProfile(data);
      } catch (err) {
        console.error('Unexpected error fetching user profile:', err);
        setError('Failed to load profile');
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, user?.id, refreshKey]);

  // Expose refresh function
  const refreshProfile = () => {
    setRefreshKey(prev => prev + 1);
  };

  return { profile, isLoading, error, refreshProfile };
};
