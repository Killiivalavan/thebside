
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
    const albumsData = await fetchSpotifyJson<any>('https://api.spotify.com/v1/browse/new-releases?limit=20');
    const tracksData = await fetchSpotifyJson<any>('https://api.spotify.com/v1/search?q=year:2024&type=track&limit=20');
    const artistsData = await fetchSpotifyJson<any>('https://api.spotify.com/v1/search?q=year:2024&type=artist&limit=20');

    const responseData = {
      albums: {
        items: albumsData.albums.items
      },
      tracks: tracksData.tracks.items,
      artists: artistsData.artists.items
    };

    return new Response(JSON.stringify(responseData), {
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
