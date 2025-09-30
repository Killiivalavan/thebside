
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const { item_id, item_type, rating, review_text, parent_id, is_private, is_relisten } = await req.json();

    if (!item_id || !item_type) {
      throw new Error('Missing required fields: item_id and item_type are required.');
    }

    // For top-level reviews, require a positive rating. For replies (when parent_id is provided), allow rating 0.
    const isReply = Boolean(parent_id);
    const isValidTopLevelRating = typeof rating === 'number' && rating >= 1 && rating <= 5;
    if (!isReply && !isValidTopLevelRating) {
      throw new Error('Rating must be provided and greater than 0 for top-level reviews.');
    }

    const reviewData = {
      user_id: user.id,
      item_id,
      item_type,
      // For replies, persist rating as null to satisfy typical CHECK constraints (1..5)
      rating: isReply ? null : rating,
      review_text,
      parent_id: parent_id || null,
      is_private: is_private || false,
      is_relisten: is_relisten || false,
    };

    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
