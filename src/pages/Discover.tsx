import { AlbumCard } from "@/components/AlbumCard";
import { TrackItem } from "@/components/TrackItem";
import { useSpotifyPopular } from "@/hooks/useSpotify";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

const Discover = () => {
  const { data: popularContent, isLoading, error } = useSpotifyPopular();
  
  // Refs for scrollable containers
  const albumsRef = useRef<HTMLDivElement>(null);
  const tracksRef = useRef<HTMLDivElement>(null);
  const artistsRef = useRef<HTMLDivElement>(null);

  // Scroll functions
  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Discover</h1>
        </div>
        <div className="text-center text-muted-foreground">Loading popular content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Discover</h1>
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
        <h1 className="text-2xl font-semibold text-foreground">DISCOVER</h1>
      </div>

      {/* Popular Albums */}
      {albums.length > 0 && (
        <section className="relative">
          <h2 className="text-lg font-semibold text-foreground mb-4">Popular Albums</h2>
          <div className="relative group">
            {/* Left Arrow */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/90 hover:bg-background border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => scrollLeft(albumsRef)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            {/* Right Arrow */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/90 hover:bg-background border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => scrollRight(albumsRef)}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            
            <div ref={albumsRef} className="-mx-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-4">
                {albums.map((album: any) => (
                  <div key={album.id} className="snap-start shrink-0 w-[10.5rem]">
                    <AlbumCard
                      id={album.id}
                      title={album.name}
                      artist={album.artists?.[0]?.name || "Unknown Artist"}
                      artistId={album.artists?.[0]?.id}
                      imageUrl={album.images?.[0]?.url}
                      size="md"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popular Tracks */}
      {tracks.length > 0 && (
        <section className="relative">
          <h2 className="text-lg font-semibold text-foreground mb-4">Popular Tracks</h2>
          <div className="relative group">
            {/* Left Arrow */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/90 hover:bg-background border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => scrollLeft(tracksRef)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            {/* Right Arrow */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/90 hover:bg-background border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => scrollRight(tracksRef)}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            
            <div ref={tracksRef} className="-mx-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-4">
                {tracks.map((track: any) => (
                  <div key={track.id} className="snap-start shrink-0 w-[10.5rem]">
                    <Link to={`/track/${track.id}`}>
                      <div className="min-w-0 w-full max-w-full">
                        <div className="w-32 h-32 mx-auto bg-muted rounded-lg overflow-hidden mb-2">
                          {track.album?.images?.[0]?.url && (
                            <img src={track.album.images[0].url} alt={track.name} className="w-full h-full object-cover object-center" />
                          )}
                        </div>
                        <div className="text-center min-w-0 w-full max-w-full">
                          <div className="font-medium text-foreground block w-full max-w-full truncate text-sm">{track.name}</div>
                          <div className="text-muted-foreground block w-full max-w-full truncate text-xs">
                            {track.artists?.map((a: any) => a.name).join(", ")}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Popular Artists */}
      {artists.length > 0 && (
        <section className="relative">
          <h2 className="text-lg font-semibold text-foreground mb-4">Popular Artists</h2>
          <div className="relative group">
            {/* Left Arrow */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/90 hover:bg-background border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => scrollLeft(artistsRef)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            {/* Right Arrow */}
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/90 hover:bg-background border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              onClick={() => scrollRight(artistsRef)}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            
            <div ref={artistsRef} className="-mx-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-4">
                {artists.map((artist: any) => (
                  <div key={artist.id} className="snap-start shrink-0 w-[10.5rem]">
                    <Link to={`/artist/${artist.id}`}>
                      <div className="min-w-0 w-full max-w-full">
                        <div className="w-32 h-32 mx-auto bg-muted rounded-full overflow-hidden mb-2">
                          {artist.images?.[0]?.url && (
                            <img src={artist.images[0].url} alt={artist.name} className="w-full h-full object-cover object-center" />
                          )}
                        </div>
                        <div className="text-center min-w-0 w-full max-w-full">
                          <div className="font-medium text-foreground block w-full max-w-full truncate text-sm">{artist.name}</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Discover;