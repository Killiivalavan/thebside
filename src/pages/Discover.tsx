import { AlbumCard } from "@/components/AlbumCard";
import { TrackItem } from "@/components/TrackItem";

const Discover = () => {
  // Mock data - will be replaced with Spotify API calls
  const popularAlbums = Array.from({ length: 5 }, (_, i) => ({
    id: `album-${i + 1}`,
    title: `Album ${i + 1}`,
    artist: `Artist ${i + 1}`,
  }));

  const popularTracks = Array.from({ length: 5 }, (_, i) => ({
    id: `track-${i + 1}`,
    title: `Track ${i + 1}`,
    artist: `Artist ${i + 1}`,
    duration: "3:17",
  }));

  const popularArtists = Array.from({ length: 5 }, (_, i) => ({
    id: `artist-${i + 1}`,
    name: `Artist ${i + 1}`,
  }));

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">discover page</h1>
      </div>

      {/* Popular Albums */}
      <section>
        <h2 className="text-lg font-medium text-foreground mb-4">popular albums</h2>
        <div className="grid grid-cols-5 gap-6">
          {popularAlbums.map((album) => (
            <AlbumCard
              key={album.id}
              id={album.id}
              title={album.title}
              artist={album.artist}
            />
          ))}
        </div>
      </section>

      {/* Popular Tracks */}
      <section>
        <h2 className="text-lg font-medium text-foreground mb-4">popular tracks</h2>
        <div className="grid grid-cols-5 gap-6">
          {popularTracks.map((track) => (
            <div key={track.id} className="bg-card border border-border rounded-lg p-4">
              <div className="w-full aspect-square bg-muted rounded-lg mb-3"></div>
              <div className="text-sm">
                <div className="font-medium text-foreground truncate">{track.title}</div>
                <div className="text-muted-foreground truncate">{track.artist}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Artists */}
      <section>
        <h2 className="text-lg font-medium text-foreground mb-4">popular artists</h2>
        <div className="grid grid-cols-5 gap-6">
          {popularArtists.map((artist) => (
            <div key={artist.id} className="bg-card border border-border rounded-lg p-4">
              <div className="w-full aspect-square bg-muted rounded-lg mb-3"></div>
              <div className="text-sm">
                <div className="font-medium text-foreground truncate">{artist.name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Discover;