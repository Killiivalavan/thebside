
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { fetchSpotifyJson } from '../_shared/spotify.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { id, market } = await req.json();

    if (!id) {
      throw new Error('Artist ID is required');
    }

    const artistData = await fetchSpotifyJson<any>(`https://api.spotify.com/v1/artists/${id}`);

    // Also fetch top tracks and albums to provide an extended view.
    // Keep response backward compatible by merging extra fields onto the artist object.
    const marketParam = market || Deno.env.get('SPOTIFY_DEFAULT_MARKET') || 'US';

    const topTracksData = await fetchSpotifyJson<any>(
      `https://api.spotify.com/v1/artists/${id}/top-tracks?market=${encodeURIComponent(marketParam)}`
    );

    const albumsData = await fetchSpotifyJson<any>(
      `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&limit=50`
    );

    const extended = {
      ...artistData,
      top_tracks: topTracksData?.tracks ?? [],
      albums_list: albumsData?.items ?? [],
    };

    return new Response(JSON.stringify(extended), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
