import { useParams, Link } from "react-router-dom";
import { TrackItem } from "@/components/TrackItem";
import { ReviewCard } from "@/components/ReviewCard";
import { useSpotifyAlbum } from "@/hooks/useSpotify";

const Album = () => {
  const { id } = useParams();
  const { data: albumData, isLoading, error } = useSpotifyAlbum(id || "");

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">album page</h1>
        </div>
        <div className="text-center text-muted-foreground">Loading album details...</div>
      </div>
    );
  }

  if (error || !albumData) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">album page</h1>
        </div>
        <div className="text-center text-red-500">Error loading album. Please try again later.</div>
      </div>
    );
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalDurationMs = albumData.tracks?.items?.reduce((acc: number, track: any) => acc + track.duration_ms, 0) || 0;
  const totalMinutes = Math.floor(totalDurationMs / 60000);
  const totalSeconds = Math.floor((totalDurationMs % 60000) / 1000);
  
  // Mock reviews - will be replaced with real reviews from database
  const reviews = [
    {
      username: "username",
      rating: 5,
      review: "blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah",
    },
    {
      username: "username",
      rating: 4,
      review: "blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">album page</h1>
      </div>

      {/* Album Info */}
      <div className="flex space-x-8">
        <div className="w-48 h-48 bg-muted border-2 border-border rounded-lg flex-shrink-0 overflow-hidden">
          {albumData.images?.[0]?.url && (
            <img 
              src={albumData.images[0].url} 
              alt={albumData.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">{albumData.name}</h2>
            <Link 
              to={`/artist/${albumData.artists?.[0]?.id}`}
              className="text-xl text-muted-foreground hover:text-foreground transition-colors"
            >
              {albumData.artists?.[0]?.name}
            </Link>
            <div className="text-muted-foreground mt-2">
              {albumData.release_date?.split('-')[0]}
            </div>
            <div className="text-muted-foreground">
              {albumData.total_tracks} tracks • {totalMinutes} mins {totalSeconds} secs
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Track Listing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Track Listing</h3>
          <div className="space-y-2">
            {albumData.tracks?.items?.map((track: any) => (
              <TrackItem
                key={track.id}
                id={track.id}
                title={track.name}
                artist={track.artists?.map((a: any) => a.name).join(", ")}
                artistId={track.artists?.[0]?.id}
                duration={formatDuration(track.duration_ms)}
                albumId={id}
              />
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">popular reviews</h3>
          </div>
          
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <ReviewCard
                key={index}
                username={review.username}
                rating={review.rating}
                review={review.review}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Album;