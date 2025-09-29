import { useParams, Link } from "react-router-dom";
import { TrackItem } from "@/components/TrackItem";
import { AlbumCard } from "@/components/AlbumCard";
import { ReviewCard } from "@/components/ReviewCard";
import { useSpotifyArtist } from "@/hooks/useSpotify";

const Artist = () => {
  const { id } = useParams();
  const { data: artistData, isLoading, error } = useSpotifyArtist(id || "");

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">artist page</h1>
        </div>
        <div className="text-center text-muted-foreground">Loading artist details...</div>
      </div>
    );
  }

  if (error || !artistData) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">artist page</h1>
        </div>
        <div className="text-center text-red-500">Error loading artist. Please try again later.</div>
      </div>
    );
  }

  console.log('Artist data:', artistData);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Mock reviews - will be replaced with real reviews from database
  const reviews = [
    {
      username: "username",
      rating: 5,
      review: "blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah",
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
        <h1 className="text-2xl font-semibold text-foreground">artist page</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Artist Info */}
          <div className="flex space-x-6">
            <div className="w-32 h-32 bg-muted border-2 border-border rounded-full flex-shrink-0 overflow-hidden">
              {artistData.images?.[0]?.url && (
                <img 
                  src={artistData.images[0].url} 
                  alt={artistData.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{artistData.name}</h2>
              <p className="text-muted-foreground">
                {artistData.followers?.total?.toLocaleString()} followers
              </p>
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">popular reviews</h3>
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

        {/* Right Column */}
        <div className="space-y-8">
          {/* Popular Tracks */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Popular Tracks</h3>
            <div className="space-y-2">
              {artistData.top_tracks?.slice(0, 5).map((track: any) => (
                <TrackItem
                  key={track.id}
                  id={track.id}
                  title={track.name}
                  artist={track.artists?.map((a: any) => a.name).join(", ")}
                  artistId={track.artists?.[0]?.id}
                  duration={formatDuration(track.duration_ms)}
                />
              ))}
            </div>
          </div>

          {/* Discography */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Discography</h3>
            <div className="grid grid-cols-3 gap-4">
              {artistData.albums_list?.slice(0, 6).map((album: any) => (
                <AlbumCard
                  key={album.id}
                  id={album.id}
                  title={album.name}
                  artist={album.artists?.[0]?.name}
                  artistId={album.artists?.[0]?.id}
                  imageUrl={album.images?.[0]?.url}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Artist;