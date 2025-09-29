
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const invoke = async (functionName: string, body?: any) => {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data;
};

export const useSpotifySearch = (query: string) => {
  return useQuery({
    queryKey: ['spotify-search', query],
    queryFn: () => invoke('search-music', { query }),
    enabled: !!query,
  });
};

export const useSpotifyPopular = () => {
  return useQuery({
    queryKey: ['spotify-popular'],
    queryFn: () => invoke('get-popular-content'),
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
