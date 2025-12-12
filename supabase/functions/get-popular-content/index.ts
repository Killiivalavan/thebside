import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchSpotifyJson, getSpotifyUserToken } from '../_shared/spotify.ts';

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    let isPersonalized = false;
    let userToken: string | null = null;

    if (user) {
      try {
        userToken = await getSpotifyUserToken(user.id, supabaseClient);
        isPersonalized = true;
      } catch (e) {
        // User not connected to Spotify, ignore
      }
    }

    const getToken = userToken ? async () => userToken! : undefined;

    let albumsData, tracksData, artistsData;

    if (isPersonalized) {
      // Personalized content
      // Parallel fetch for performance
      const [albums, tracks, artists] = await Promise.all([
        fetchSpotifyJson<any>('https://api.spotify.com/v1/browse/new-releases?limit=20', {}, {}, getToken),
        fetchSpotifyJson<any>('https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=short_term', {}, {}, getToken),
        fetchSpotifyJson<any>('https://api.spotify.com/v1/me/top/artists?limit=20&time_range=short_term', {}, {}, getToken)
      ]);
      albumsData = albums;
      tracksData = tracks;
      artistsData = artists;
    } else {
      // Generic content
      const [albums, tracks, artists] = await Promise.all([
        fetchSpotifyJson<any>('https://api.spotify.com/v1/browse/new-releases?limit=20'),
        fetchSpotifyJson<any>('https://api.spotify.com/v1/search?q=year:2024&type=track&limit=20'),
        fetchSpotifyJson<any>('https://api.spotify.com/v1/search?q=year:2024&type=artist&limit=20')
      ]);
      albumsData = albums;
      tracksData = tracks;
      artistsData = artists;
    }

    const responseData = {
      albums: {
        items: albumsData.albums?.items || albumsData.items
      },
      tracks: isPersonalized ? tracksData.items : tracksData.tracks.items,
      artists: isPersonalized ? artistsData.items : artistsData.artists.items,
      isPersonalized
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
