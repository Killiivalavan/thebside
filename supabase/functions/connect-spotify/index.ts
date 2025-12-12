import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { exchangeCodeForTokens } from '../_shared/spotify.ts';

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
        console.log('Connect Spotify: Starting...');
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        const {
            data: { user },
        } = await supabaseClient.auth.getUser();

        if (!user) {
            console.error('Connect Spotify: User not authenticated');
            throw new Error('User not authenticated');
        }

        console.log('Connect Spotify: User authenticated:', user.id);

        const { code, redirect_uri } = await req.json();

        if (!code || !redirect_uri) {
            console.error('Connect Spotify: Missing code or redirect_uri');
            throw new Error('Missing code or redirect_uri');
        }

        console.log('Connect Spotify: Exchanging code for tokens with redirect_uri:', redirect_uri);

        const tokens = await exchangeCodeForTokens(code, redirect_uri);

        console.log('Connect Spotify: Tokens received, storing in database...');

        // Store refresh token
        const { error: dbError } = await supabaseClient
            .from('spotify_tokens')
            .upsert({
                user_id: user.id,
                refresh_token: tokens.refresh_token,
                updated_at: new Date().toISOString(),
            });

        if (dbError) {
            console.error('Connect Spotify: Database error:', dbError);
            throw dbError;
        }

        console.log('Connect Spotify: Success!');

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Connect Spotify: Error:', error);
        console.error('Connect Spotify: Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
        });
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
