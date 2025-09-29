import { useParams, Link } from "react-router-dom";
import { ReviewCard } from "@/components/ReviewCard";
import { useSpotifyTrack } from "@/hooks/useSpotify";

const Track = () => {
  const { id } = useParams();
  const { data: trackData, isLoading, error } = useSpotifyTrack(id || "");

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">track page</h1>
        </div>
        <div className="text-center text-muted-foreground">Loading track details...</div>
      </div>
    );
  }

  if (error || !trackData) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">track page</h1>
        </div>
        <div className="text-center text-red-500">Error loading track. Please try again later.</div>
      </div>
    );
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes} mins ${seconds} secs`;
  };

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
        <h1 className="text-2xl font-semibold text-foreground">track page</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Track Info */}
        <div className="space-y-6">
          <div className="flex space-x-6">
            <div className="w-48 h-48 bg-muted border-2 border-border rounded-lg flex-shrink-0 overflow-hidden">
              {trackData.album?.images?.[0]?.url && (
                <img 
                  src={trackData.album.images[0].url} 
                  alt={trackData.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{trackData.name}</h2>
                <Link 
                  to={`/artist/${trackData.artists?.[0]?.id}`}
                  className="text-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  {trackData.artists?.map((a: any) => a.name).join(", ")}
                </Link>
              </div>
              <div className="text-muted-foreground space-y-1">
                <div>{trackData.album?.release_date?.split('-')[0]}</div>
                <div>{formatDuration(trackData.duration_ms)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Reviews */}
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

export default Track;