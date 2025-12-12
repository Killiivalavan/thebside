import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { fetchSpotifyJson, getSpotifyUserToken, getSpotifyToken } from '../_shared/spotify.ts';

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
    const { query, offset = 0, limit = 20, type } = await req.json();

    if (!query) {
      throw new Error('Query parameter is required');
    }

    // Create Supabase client to get user context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Helper to get the best available token (User > Client)
    const getToken = async () => {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          return await getSpotifyUserToken(user.id, supabaseClient);
        }
      } catch (e) {
        console.warn('Failed to get user token, falling back to client credentials', e);
      }
      return await getSpotifyToken();
    };

    const searchType = type || 'album,artist,track,playlist';
    const searchData = await fetchSpotifyJson<any>(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${searchType}&offset=${offset}&limit=${limit}`,
      undefined,
      undefined,
      getToken
    );

    return new Response(JSON.stringify(searchData), {
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