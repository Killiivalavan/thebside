import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export const useUserProfile = (username?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-profile', username],
    queryFn: async () => {
      if (!username) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle();
        
      if (error) throw new Error(error.message);
      
      return data;
    },
    enabled: !!username,
    retry: false,
  });
};

export const useCurrentUserProfile = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['current-user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!user?.id,
  });
};

export const useUserReviews = (userId: string) => {
  return useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users!reviews_user_id_fkey(username, avatar_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    },
    enabled: !!userId,
  });
};

export const useUserLists = (userId: string) => {
  return useQuery({
    queryKey: ['user-lists', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('lists')
        .select(`
          *,
          list_items(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    },
    enabled: !!userId,
  });
};

export const useUserListeningHistory = (userId: string) => {
  return useQuery({
    queryKey: ['user-listening-history', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('listened_log')
        .select('*')
        .eq('user_id', userId)
        .order('listened_at', { ascending: false });
        
      if (error) {
        throw new Error(error.message);
      }
      
      return data || [];
    },
    enabled: !!userId,
  });
};
