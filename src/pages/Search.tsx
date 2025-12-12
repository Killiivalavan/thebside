import { useSearchParams, Link } from "react-router-dom";
import { AlbumCard } from "@/components/AlbumCard";
import { useSpotifySearch } from "@/hooks/useSpotify";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchUsers } from "@/hooks/useFollow";
import { Avatar } from "@/components/Avatar";
import { useSearchFilters } from "@/context/SearchFilterContext";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { filters } = useSearchFilters();

  // Main search for Albums, Artists, Tracks (limit 10 for consistency)
  const { data: searchResults, isLoading, error } = useSpotifySearch(query, 0, 10, 'album,artist,track');
  
  // Search Users
  const { data: usersData } = useSearchUsers(query);
  const users = usersData || [];

  // Dedicated search for Playlists with pagination

  // Dedicated search for Playlists with pagination
  const [playlistOffset, setPlaylistOffset] = useState(0);
  const { data: playlistData, isLoading: isPlaylistLoading } = useSpotifySearch(query, playlistOffset, 10, 'playlist');

  // Reset offset when query changes
  useEffect(() => {
    setPlaylistOffset(0);
  }, [query]);

  if (!query) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">search results</h1>
          <p className="text-muted-foreground mt-2">Enter a search term to find music</p>
        </div>
      </div>
    );
  }

  if (isLoading && playlistOffset === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">search results</h1>
          <p className="text-muted-foreground mt-2">Searching for "{query}"...</p>
        </div>
        <div className="text-center text-muted-foreground">Loading results...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">search results</h1>
          <p className="text-muted-foreground mt-2">Searching for "{query}"</p>
        </div>
        <div className="text-center text-red-500">Error loading search results. Please try again.</div>
      </div>
    );
  }

  const albums = searchResults?.albums?.items || [];
  const tracks = searchResults?.tracks?.items || [];
  const artists = searchResults?.artists?.items || [];
  const playlists = playlistData?.playlists?.items?.filter((p: any) => p) || [];

  const hasResults = 
    (filters.albums && albums.length > 0) || 
    (filters.tracks && tracks.length > 0) || 
    (filters.artists && artists.length > 0) || 
    (filters.playlists && playlists.length > 0) || 
    (filters.users && users.length > 0);

  const handleNextPlaylists = () => {
    setPlaylistOffset(prev => prev + 10);
  };

  const handlePrevPlaylists = () => {
    setPlaylistOffset(prev => Math.max(0, prev - 10));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">search results</h1>
        <p className="text-muted-foreground mt-2">
          {hasResults ? `Results for "${query}"` : `No results found for "${query}"`}
        </p>
      </div>

      {/* Tracks */}
      {filters.tracks && tracks.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Tracks</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {tracks.slice(0, 10).map((track: any) => (
              <Link key={track.id} to={`/track/${track.id}`}>
                <div className="bg-card border border-border rounded-lg p-4 hover:border-foreground transition-colors">
                  <div className="w-full aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                    {track.album?.images?.[0]?.url && (
                      <img
                        src={track.album.images[0].url}
                        alt={track.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-foreground truncate">{track.name}</div>
                    <div className="text-muted-foreground truncate">
                      {track.artists?.map((a: any) => a.name).join(", ")}
                    </div>
                    <div className="text-muted-foreground text-xs">Track</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Albums */}
      {filters.albums && albums.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {albums.slice(0, 10).map((album: any) => (
              <AlbumCard
                key={album.id}
                id={album.id}
                title={album.name}
                artist={album.artists?.[0]?.name || "Unknown Artist"}
                artistId={album.artists?.[0]?.id}
                imageUrl={album.images?.[0]?.url}
              />
            ))}
          </div>
        </section>
      )}

      {/* Artists */}
      {filters.artists && artists.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">Artists</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {artists.slice(0, 10).map((artist: any) => (
              <Link key={artist.id} to={`/artist/${artist.id}`}>
                <div className="bg-card border border-border rounded-lg p-4 hover:border-foreground transition-colors">
                  <div className="w-full aspect-square bg-muted rounded-full mb-3 overflow-hidden">
                    {artist.images?.[0]?.url && (
                      <img
                        src={artist.images[0].url}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-foreground truncate text-center">{artist.name}</div>
                    <div className="text-muted-foreground text-center text-xs">Artist</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Users */}
      {filters.users && users.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">People</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {users.map((user: any) => (
              <Link key={user.id} to={`/profile/${user.username}`}>
                <div className="bg-card border border-border rounded-lg p-4 hover:border-foreground transition-colors flex flex-col items-center">
                  <div className="w-24 h-24 mb-3">
                    <Avatar src={user.avatar_url} alt={user.username} size="2xl" className="w-full h-full" />
                  </div>
                  <div className="text-sm text-center">
                    <div className="font-medium text-foreground truncate">{user.username}</div>
                    <div className="text-muted-foreground text-xs">User</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Playlists with Pagination */}
      {filters.playlists && (playlists.length > 0 || playlistOffset > 0) && (
        <section className="relative group/section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-foreground">Playlists</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevPlaylists}
                disabled={playlistOffset === 0 || isPlaylistLoading}
                className="h-8 w-8 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextPlaylists}
                disabled={playlists.length < 10 || isPlaylistLoading}
                className="h-8 w-8 rounded-full"
              >
                {isPlaylistLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 min-h-[200px]">
            {playlists.map((playlist: any) => (
              <AlbumCard
                key={playlist.id}
                id={playlist.id}
                title={playlist.name}
                artist={`By ${playlist.owner.display_name}`}
                imageUrl={playlist.images?.[0]?.url}
                type="playlist"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Search;
