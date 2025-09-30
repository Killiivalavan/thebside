
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchSpotifyJson } from '../_shared/spotify.ts';
import { fetchAndStructureReviewThreads } from '../_shared/reviews.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const marketParam = market || Deno.env.get('SPOTIFY_DEFAULT_MARKET') || 'US';

    // Fetch all data in parallel
    const [
      artistData,
      topTracksData,
      albumsData,
      reviewThreads
    ] = await Promise.all([
      fetchSpotifyJson<any>(`https://api.spotify.com/v1/artists/${id}`),
      fetchSpotifyJson<any>(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=${encodeURIComponent(marketParam)}`),
      fetchSpotifyJson<any>(`https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&limit=50`),
      fetchAndStructureReviewThreads(supabaseAdmin, id)
    ]);

    // Combine the data
    const responsePayload = {
      ...artistData,
      top_tracks: topTracksData?.tracks ?? [],
      albums_list: albumsData?.items ?? [],
      reviews: reviewThreads,
    };

    return new Response(JSON.stringify(responsePayload), {
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
