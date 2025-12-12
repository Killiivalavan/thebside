import { AlbumCard } from "@/components/AlbumCard";
import { SocialActivityFeed } from "@/components/SocialActivityFeed";
import { TrackItem } from "@/components/TrackItem";
import { useSpotifyPopular, useSpotifyRecommendedAlbums, connectSpotify, exchangeSpotifyCode } from "@/hooks/useSpotify";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Music, ListMusic, User, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";

const Discover = () => {
  const { data: popularContent, isLoading, error, isRefetching, refetch } = useSpotifyPopular();
  const { data: recommendedAlbums, isLoading: isAlbumsLoading } = useSpotifyRecommendedAlbums(
    !!popularContent?.isPersonalized,
    popularContent?.artists || []
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    // Show modal if not connected and haven't seen it in this session
    if (popularContent && !popularContent.isPersonalized && !sessionStorage.getItem('spotify_modal_seen')) {
      const timer = setTimeout(() => setShowConnectModal(true), 1500); // Delay slightly for better UX
      return () => clearTimeout(timer);
    }
  }, [popularContent]);

  const handleCloseModal = () => {
    setShowConnectModal(false);
    sessionStorage.setItem('spotify_modal_seen', 'true');
  };

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      console.log('Attempting to exchange Spotify code...');
      exchangeSpotifyCode(code)
        .then(async () => {
          console.log('Spotify code exchange successful!');
          setSearchParams({});
          await queryClient.invalidateQueries({ queryKey: ['spotify-popular'] });
          await queryClient.invalidateQueries({ queryKey: ['spotify-status'] });
          refetch(); // Explicitly force a refetch
          toast({
            title: "Connected to Spotify!",
            description: "Your discover page is now personalized.",
          });
        })
        .catch((err) => {
          console.error('Spotify connection error:', err);
          console.error('Error details:', {
            message: err.message,
            stack: err.stack,
            response: err.response,
          });
          toast({
            title: "Connection Failed",
            description: `Could not connect to Spotify: ${err.message || 'Unknown error'}`,
            variant: "destructive",
          });
        });
    }
  }, [searchParams, setSearchParams, queryClient, toast]);

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

      {/* Connect Spotify CTA */}
      {popularContent && !popularContent.isPersonalized && (
        <div className="hidden bg-card/50 border border-border/50 rounded-lg p-6 text-center max-w-md mx-auto backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-2">Personalize Your Experience</h2>
          <p className="text-muted-foreground mb-4 text-sm">Connect your Spotify account to get recommendations based on your listening history.</p>
          <Button
            onClick={connectSpotify}
            disabled={isRefetching}
            className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-medium rounded-full px-8"
          >
            {isRefetching ? 'Updating...' : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5 mr-1.5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
                Connect
              </>
            )}
          </Button>
        </div>
      )}

      {/* Albums Section */}
      <section className="relative">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {popularContent?.isPersonalized ? "Albums for You" : "New Releases"}
        </h2>

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

          {popularContent?.isPersonalized && isAlbumsLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="min-w-[160px] space-y-3">
                  <div className="w-40 h-40 bg-muted animate-pulse rounded-md" />
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div ref={albumsRef} className="-mx-4 px-4 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-4">
                {(popularContent?.isPersonalized ? recommendedAlbums : popularContent?.albums?.items)?.map((album: any) => (
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
                {popularContent?.isPersonalized && recommendedAlbums?.length === 0 && (
                  <div className="text-muted-foreground text-sm p-4">
                    No recommendations found. Try listening to more artists!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Popular Tracks */}
      {tracks.length > 0 && (
        <section className="relative">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {popularContent?.isPersonalized ? "Your Favourites" : "Popular Tracks"}
          </h2>
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
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {popularContent?.isPersonalized ? "Top Artists" : "Popular Artists"}
          </h2>
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
      {/* Social Activity Section */}
      <SocialActivityFeed />

      {/* Connect Spotify Modal */}
      <Dialog open={false} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="hidden sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Unlock the Full Experience</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Connect your Spotify account to unlock new and exciting features.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl"><Music className="w-5 h-5 text-primary" /></span>
                <span>Personalized Discover Page</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl"><ListMusic className="w-5 h-5 text-primary" /></span>
                <span>Convert Lists to Playlists</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl"><User className="w-5 h-5 text-primary" /></span>
                <span>Your Top Artists & Tracks</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl"><Radio className="w-5 h-5 text-primary" /></span>
                <span>Album Recommendations</span>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              className="w-full sm:w-auto bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold !border-0 !outline-none !ring-0 !ring-offset-0 shadow-none"
              onClick={connectSpotify}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 mr-1.5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default Discover;