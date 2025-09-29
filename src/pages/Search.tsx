import { useSearchParams, Link } from "react-router-dom";
import { AlbumCard } from "@/components/AlbumCard";
import { useSpotifySearch } from "@/hooks/useSpotify";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const { data: searchResults, isLoading, error } = useSpotifySearch(query);

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

  if (isLoading) {
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

  const hasResults = albums.length > 0 || tracks.length > 0 || artists.length > 0;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">search results</h1>
        <p className="text-muted-foreground mt-2">
          {hasResults ? `Results for "${query}"` : `No results found for "${query}"`}
        </p>
      </div>

      {/* Albums */}
      {albums.length > 0 && (
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
      {artists.length > 0 && (
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

      {/* Tracks */}
      {tracks.length > 0 && (
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
    </div>
  );
};

export default Search;
