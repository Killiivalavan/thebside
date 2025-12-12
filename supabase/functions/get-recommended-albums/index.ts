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

        if (!user) {
            throw new Error('User not authenticated');
        }

        const userToken = await getSpotifyUserToken(user.id, supabaseClient);
        const getToken = async () => userToken;

        const { seedArtists } = await req.json().catch(() => ({ seedArtists: null }));

        let topArtists = [];

        if (seedArtists && Array.isArray(seedArtists) && seedArtists.length > 0) {
            console.log(`Using ${seedArtists.length} seed artists from client`);
            topArtists = seedArtists.slice(0, 5);
        } else {
            // 1. Get User's Top Artists (Seed)
            console.log("Fetching top artists from Spotify...");
            const topArtistsData = await fetchSpotifyJson<any>(
                'https://api.spotify.com/v1/me/top/artists?limit=5&time_range=short_term',
                {}, {}, getToken
            );
            topArtists = topArtistsData.items || [];
        }

        console.log(`Found ${topArtists.length} top artists`);

        if (topArtists.length === 0) {
            return new Response(JSON.stringify({ albums: [] }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 2. Get Recommendations using Seed Artists
        // We can pass up to 5 seeds. We have 3.
        const validArtists = topArtists.filter((a: any) => a && a.id);
        if (validArtists.length === 0) {
            console.log("No valid seed artists found");
            return new Response(JSON.stringify({ albums: [] }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // 2. Get Albums for Top Artists
        // Since 'related-artists' and 'recommendations' are deprecated/flaky,
        // we will fetch the catalog of the user's top artists directly.
        console.log("Fetching albums for top artists...");

        const albumPromises = validArtists.map((artist: any) => {
            const url = `https://api.spotify.com/v1/artists/${artist.id}/albums?include_groups=album,single&limit=5&market=US`;
            console.log(`Fetching albums for ${artist.name} (ID: ${artist.id})`);
            return fetchSpotifyJson<any>(url, {}, {}, getToken)
                .then(data => data.items || [])
                .catch(err => {
                    console.error(`Failed to fetch albums for ${artist.name}:`, err);
                    return [];
                });
        });

        const results = await Promise.all(albumPromises);

        // 3. Flatten and Deduplicate
        const allAlbums: any[] = [];
        const seenAlbumIds = new Set();

        results.forEach((artistAlbums: any[]) => {
            artistAlbums.forEach(album => {
                if (!seenAlbumIds.has(album.id)) {
                    allAlbums.push(album);
                    seenAlbumIds.add(album.id);
                }
            });
        });

        console.log(`Found ${allAlbums.length} total albums`);

        // 4. Shuffle
        const shuffledAlbums = allAlbums.sort(() => 0.5 - Math.random());

        return new Response(JSON.stringify({ albums: shuffledAlbums.slice(0, 20) }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Error in get-recommended-albums:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
