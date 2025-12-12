import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export function useFollowStatus(targetUserId: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['follow-status', targetUserId],
    queryFn: async () => {
      if (!user || !targetUserId) return false;
      const { data, error } = await supabase
        .from('follows' as any)
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!targetUserId && user.id !== targetUserId,
  });
}

export function useFollowCounts(targetUserId: string | undefined) {
  return useQuery({
    queryKey: ['follow-counts', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return { followers: 0, following: 0 };
      const { data, error } = await (supabase as any)
        .rpc('get_profile_stats', { user_id: targetUserId });
      
      if (error) throw error;
      return data as { followers: number; following: number };
    },
    enabled: !!targetUserId,
  });
}

export function useFollowMutation(targetUserId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (isFollowing: boolean) => {
      if (!user) throw new Error("Not authenticated");
      
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows' as any)
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('follows' as any)
          .insert({ follower_id: user.id, following_id: targetUserId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-status', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['follow-counts', targetUserId] });
      // Invalidate own following count if checking own profile elsewhere
      queryClient.invalidateQueries({ queryKey: ['follow-counts', user?.id] });
    },
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['search-users', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(10);
        
      if (error) throw error;
      return data;
    },
    enabled: query.length >= 2,
  });
}

// Hook to get activities from followed users
export function useSocialActivity() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['social-activity'],
    queryFn: async () => {
      if (!user) return [];

      // Get users I follow
      const { data: following } = await supabase
        .from('follows' as any)
        .select('following_id')
        .eq('follower_id', user.id);
        
      if (!following || following.length === 0) return [];

      const followingIds = (following as any[]).map(f => f.following_id);

      // Calculate date 7 days ago
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const oneWeekAgoISO = oneWeekAgo.toISOString();

      // Fetch recent reviews (last 7 days only)
      const { data: reviews, error: reviewError } = await supabase
        .from('reviews')
        .select('*, user:user_id(username, avatar_url)')
        .in('user_id', followingIds)
        .gte('created_at', oneWeekAgoISO)
        .order('created_at', { ascending: false })
        .limit(20);

      if (reviewError) throw reviewError;

      // Fetch recent lists (last 7 days only)
      const { data: lists, error: listError } = await supabase
        .from('lists')
        .select('*, user:user_id(username, avatar_url)')
        .in('user_id', followingIds)
        .gte('created_at', oneWeekAgoISO)
        .order('created_at', { ascending: false })
        .limit(10);

      if (listError) throw listError;

      // Combine and sort
      const activity = [
        ...(reviews || []).map(r => ({ ...r, type: 'review' })),
        ...(lists || []).map(l => ({ ...l, type: 'list' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return activity;
    },
    enabled: !!user,
  });
}
