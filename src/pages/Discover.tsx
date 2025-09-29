import { AlbumCard } from "@/components/AlbumCard";
import { TrackItem } from "@/components/TrackItem";
import { useSpotifyPopular } from "@/hooks/useSpotify";
import { Link } from "react-router-dom";

const Discover = () => {
  const { data: popularContent, isLoading, error } = useSpotifyPopular();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">discover page</h1>
        </div>
        <div className="text-center text-muted-foreground">Loading popular content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">discover page</h1>
        </div>
        <div className="text-center text-red-500">Error loading content. Please try again later.</div>
      </div>
    );
  }

  const albums = popularContent?.albums?.items || [];
  const tracks = popularContent?.tracks || [];
  const artists = popularContent?.artists || [];
  
  console.log('Popular content data:', popularContent);
  console.log('Albums:', albums);

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">discover page</h1>
      </div>

      {/* Popular Albums */}
      {albums.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">popular albums</h2>
          <div className="grid grid-cols-5 gap-6">
            {albums.map((album: any) => (
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

      {/* Popular Tracks */}
      {tracks.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">popular tracks</h2>
          <div className="grid grid-cols-5 gap-6">
            {tracks.map((track: any) => (
              <Link key={track.id} to={`/track/${track.id}`}>
                <div className="bg-card border border-border rounded-lg p-4 hover:border-foreground transition-colors">
                  <div className="w-full aspect-square bg-muted rounded-lg mb-3">
                    {track.album?.images?.[0]?.url && (
                      <img 
                        src={track.album.images[0].url} 
                        alt={track.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-foreground truncate">{track.name}</div>
                    <div className="text-muted-foreground truncate">
                      {track.artists?.map((a: any) => a.name).join(", ")}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Artists */}
      {artists.length > 0 && (
        <section>
          <h2 className="text-lg font-medium text-foreground mb-4">popular artists</h2>
          <div className="grid grid-cols-5 gap-6">
            {artists.map((artist: any) => (
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

export default Discover;