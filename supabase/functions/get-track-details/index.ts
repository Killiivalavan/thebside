
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
    const { id } = await req.json();

    if (!id) {
      throw new Error('Track ID is required');
    }

    const trackData = await fetchSpotifyJson<any>(`https://api.spotify.com/v1/tracks/${id}`);

    return new Response(JSON.stringify(trackData), {
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
