import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchSpotifyJson } from '../_shared/spotify.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ItemInput = { item_id: string; item_type: 'album' | 'track' | 'artist' | 'playlist' };
type ItemOutput = { item_id: string; item_type: 'album' | 'track' | 'artist' | 'playlist'; name: string; image_url?: string; primary_artist?: string };

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { items, market } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('items must be a non-empty array');
    }

    // Tie to caller's auth for consistency with other functions
    createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } }
    );

    const marketParam = market || Deno.env.get('SPOTIFY_DEFAULT_MARKET') || 'US';

    const byType: Record<'album' | 'track' | 'artist' | 'playlist', string[]> = { album: [], track: [], artist: [], playlist: [] };
    for (const it of items as ItemInput[]) {
      if (it?.item_id && (it.item_type === 'album' || it.item_type === 'track' || it.item_type === 'artist' || it.item_type === 'playlist')) {
        byType[it.item_type].push(it.item_id);
      }
    }

    const results: ItemOutput[] = [];

    // Albums: batch up to 20
    for (const group of chunk(byType.album, 20)) {
      if (group.length === 0) continue;
      const data = await fetchSpotifyJson<any>(`https://api.spotify.com/v1/albums?ids=${encodeURIComponent(group.join(','))}`);
      for (const a of data?.albums || []) {
        const image = a?.images?.[0]?.url as string | undefined;
        const artistName = a?.artists?.[0]?.name as string | undefined;
        results.push({ item_id: a.id, item_type: 'album', name: a.name, image_url: image, primary_artist: artistName });
      }
    }

    // Tracks: batch up to 50
    for (const group of chunk(byType.track, 50)) {
      if (group.length === 0) continue;
      const data = await fetchSpotifyJson<any>(`https://api.spotify.com/v1/tracks?ids=${encodeURIComponent(group.join(','))}&market=${encodeURIComponent(marketParam)}`);
      for (const t of data?.tracks || []) {
        const image = t?.album?.images?.[0]?.url as string | undefined;
        const artistName = t?.artists?.[0]?.name as string | undefined;
        results.push({ item_id: t.id, item_type: 'track', name: t.name, image_url: image, primary_artist: artistName });
      }
    }

    // Artists: batch up to 50
    for (const group of chunk(byType.artist, 50)) {
      if (group.length === 0) continue;
      const data = await fetchSpotifyJson<any>(`https://api.spotify.com/v1/artists?ids=${encodeURIComponent(group.join(','))}`);
      for (const ar of data?.artists || []) {
        const image = ar?.images?.[0]?.url as string | undefined;
        results.push({ item_id: ar.id, item_type: 'artist', name: ar.name, image_url: image });
      }
    }

    // Playlists: one by one (Spotify API no batch) -- fetch in parallel
    if (byType.playlist.length > 0) {
      const playlistPromises = byType.playlist.map(async (id) => {
        try {
          const data = await fetchSpotifyJson<any>(`https://api.spotify.com/v1/playlists/${id}?fields=id,name,images,owner(display_name)`);
          const image = data?.images?.[0]?.url as string | undefined;
          const ownerName = data?.owner?.display_name as string | undefined;
          return { 
            item_id: data.id, 
            item_type: 'playlist' as const, 
            name: data.name, 
            image_url: image,
            primary_artist: ownerName ? `By ${ownerName}` : undefined 
          };
        } catch (e) {
          console.error(`Failed to fetch playlist ${id}:`, e);
          return null;
        }
      });

      const playlistResults = await Promise.all(playlistPromises);
      for (const res of playlistResults) {
        if (res) results.push(res);
      }
    }

    return new Response(JSON.stringify({ data: results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 });
  }
});


