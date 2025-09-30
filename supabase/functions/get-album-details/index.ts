
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
    const { id } = await req.json();
    if (!id) {
      throw new Error('Album ID is required');
    }

    // Create a Supabase client with the user's auth token to enforce RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Fetch album data from Spotify and review threads from Supabase in parallel
    const [albumData, reviewThreads] = await Promise.all([
      fetchSpotifyJson<any>(`https://api.spotify.com/v1/albums/${id}`),
      fetchAndStructureReviewThreads(supabase, id),
    ]);

    // Combine the data
    const responsePayload = {
      ...albumData,
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
