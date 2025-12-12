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

        const { name, description, items } = await req.json();
        console.log(`Received request to create playlist: ${name}, items: ${items?.length}`);

        if (!name || !items || !Array.isArray(items)) {
            throw new Error('Missing name or items array');
        }

        const userToken = await getSpotifyUserToken(user.id, supabaseClient);
        const getToken = async () => userToken;

        // Resolve all items to track URIs
        const allTrackUris: string[] = [];

        for (const item of items) {
            if (item.type === 'track') {
                allTrackUris.push(`spotify:track:${item.id}`);
            } else if (item.type === 'album') {
                try {
                    // Fetch album tracks
                    const albumTracks = await fetchSpotifyJson<any>(
                        `https://api.spotify.com/v1/albums/${item.id}/tracks?limit=50`,
                        {}, {}, getToken
                    );
                    if (albumTracks.items) {
                        albumTracks.items.forEach((t: any) => allTrackUris.push(t.uri));
                    }
                } catch (e) {
                    console.error(`Failed to fetch tracks for album ${item.id}`, e);
                }
            } else if (item.type === 'artist') {
                try {
                    // Fetch artist top tracks
                    const topTracks = await fetchSpotifyJson<any>(
                        `https://api.spotify.com/v1/artists/${item.id}/top-tracks?market=US`,
                        {}, {}, getToken
                    );
                    if (topTracks.tracks) {
                        // Take top 5
                        topTracks.tracks.slice(0, 5).forEach((t: any) => allTrackUris.push(t.uri));
                    }
                } catch (e) {
                    console.error(`Failed to fetch top tracks for artist ${item.id}`, e);
                }
            }
        }

        // Deduplicate URIs
        const uniqueUris = [...new Set(allTrackUris)];
        console.log(`Resolved ${uniqueUris.length} unique track URIs`);

        // 1. Create Playlist
        console.log('Creating playlist on Spotify...');
        const playlist = await fetchSpotifyJson<any>(
            'https://api.spotify.com/v1/me/playlists',
            {
                method: 'POST',
                body: JSON.stringify({
                    name: name,
                    description: description || 'Created via The B-Side',
                    public: false
                })
            },
            {},
            getToken
        );
        console.log(`Playlist created: ${playlist.id}`);

        // 2. Add Tracks (Chunked)
        const chunkSize = 100;
        for (let i = 0; i < uniqueUris.length; i += chunkSize) {
            const chunk = uniqueUris.slice(i, i + chunkSize);
            console.log(`Adding chunk ${i / chunkSize + 1} with ${chunk.length} tracks`);
            await fetchSpotifyJson(
                `https://api.spotify.com/v1/playlists/${playlist.id}/tracks`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        uris: chunk
                    })
                },
                {},
                getToken
            );
        }

        return new Response(JSON.stringify({ success: true, playlistId: playlist.id, externalUrl: playlist.external_urls.spotify }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        console.error('Error in create-playlist:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
