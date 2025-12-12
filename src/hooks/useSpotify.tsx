
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const invoke = async <T = any>(functionName: string, body?: any): Promise<T> => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data as T;
};

export const useSpotifySearch = (query: string, offset = 0, limit = 20, type?: string) => {
  return useQuery({
    queryKey: ['spotify-search', query, offset, limit, type],
    queryFn: () => invoke('search-music', { query, offset, limit, type }),
    enabled: !!query,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });
};

export const useSpotifyPopular = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['spotify-popular'],
    queryFn: async () => {
      const data = await invoke<any>('get-popular-content');
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useSpotifyRecommendedAlbums = (enabled: boolean, seedArtists: any[] = []) => {
  return useQuery({
    queryKey: ['spotify-recommended-albums', seedArtists.map((a: any) => a.id).join(',')],
    queryFn: async () => {
      const data = await invoke<{ albums: any[] }>('get-recommended-albums', {
        body: { seedArtists }
      });
      return data.albums;
    },
    enabled: enabled && seedArtists.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
};
export const useSpotifyAlbum = (id: string) => {
  return useQuery({
    queryKey: ['spotify-album', id],
    queryFn: () => invoke('get-album-details', { id }),
    enabled: !!id,
  });
};

export const useSpotifyArtist = (id: string) => {
  return useQuery({
    queryKey: ['spotify-artist', id],
    queryFn: () => invoke('get-artist-details', { id }),
    enabled: !!id,
  });
};

export const useSpotifyTrack = (id: string) => {
  return useQuery({
    queryKey: ['spotify-track', id],
    queryFn: () => invoke('get-track-details', { id }),
    enabled: !!id,
  });
};

export const useSpotifyPlaylist = (id: string) => {
  return useQuery({
    queryKey: ['spotify-playlist', id],
    queryFn: () => invoke('get-playlist-details', { id }),
    enabled: !!id,
  });
};


export const useCreatePlaylist = () => {
  return useMutation({
    mutationFn: (data: { name: string; description?: string; items: { id: string; type: string }[] }) =>
      invoke<{ success: true; playlistId: string; externalUrl: string }>('create-playlist', data),
  });
};

export const useDisconnectSpotify = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => invoke('disconnect-spotify'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spotify-popular'] });
      queryClient.invalidateQueries({ queryKey: ['spotify-status'] });
    },
  });
};

export const useSpotifyConnectionStatus = () => {
  return useQuery({
    queryKey: ['spotify-status'],
    queryFn: async () => {
      // We can infer status from get-popular-content or check the table directly via a new function.
      // For simplicity, let's just check if get-popular-content returns isPersonalized=true
      // A better way would be a dedicated endpoint, but this saves a function deploy for now.
      const data = await invoke<{ isPersonalized: boolean }>('get-popular-content');
      return data.isPersonalized;
    }
  });
};

export const connectSpotify = async () => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const redirectUri = `${window.location.origin}/discover`;
  const scope = 'user-read-private user-read-email user-top-read playlist-modify-public playlist-modify-private';

  // Generate random state for security
  const state = Math.random().toString(36).substring(7);
  localStorage.setItem('spotify_auth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scope,
    redirect_uri: redirectUri,
    state: state,
  });

  console.log('Spotify Redirect URI:', redirectUri);
  console.log('Full Auth URL:', `https://accounts.spotify.com/authorize?${params.toString()}`);

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const exchangeSpotifyCode = async (code: string) => {
  const redirectUri = `${window.location.origin}/discover`;
  return invoke('connect-spotify', { code, redirect_uri: redirectUri });
};
