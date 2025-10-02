import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const { list_id } = await req.json();
    if (!list_id || typeof list_id !== 'string') {
      return new Response(JSON.stringify({ error: 'list_id is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Delete list; RLS ensures only owner can delete. If cascade is not set,
    // delete list items first, then list. We'll attempt cascade by default and
    // fall back to manual deletion if needed.
    const { error: delError } = await supabase
      .from('lists')
      .delete()
      .eq('id', list_id);

    if (delError) {
      // try manual deletion path for foreign key constraints without cascade
      const { error: itemsError } = await supabase
        .from('list_items')
        .delete()
        .eq('list_id', list_id);

      if (itemsError) {
        return new Response(JSON.stringify({ error: itemsError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const { error: listError } = await supabase
        .from('lists')
        .delete()
        .eq('id', list_id);

      if (listError) {
        return new Response(JSON.stringify({ error: listError.message }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});


