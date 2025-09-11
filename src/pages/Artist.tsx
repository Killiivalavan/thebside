import { useParams, Link } from "react-router-dom";
import { TrackItem } from "@/components/TrackItem";
import { AlbumCard } from "@/components/AlbumCard";
import { ReviewCard } from "@/components/ReviewCard";

const Artist = () => {
  const { id } = useParams();

  // Mock data - will be replaced with Spotify API calls
  const artistData = {
    id,
    name: "artist name",
    monthlyListeners: "1,234,567",
    topTracks: Array.from({ length: 5 }, (_, i) => ({
      id: `track-${i + 1}`,
      title: `track name`,
      artist: "artist 1, artist2",
      duration: "3:17",
    })),
    discography: Array.from({ length: 3 }, (_, i) => ({
      id: `album-${i + 1}`,
      title: `Album ${i + 1}`,
      artist: "artist name",
    })),
    reviews: [
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
    ],
  };

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
            <div className="w-32 h-32 bg-muted border-2 border-border rounded-lg flex-shrink-0"></div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{artistData.name}</h2>
              <p className="text-muted-foreground">{artistData.monthlyListeners} monthly listeners</p>
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">popular reviews</h3>
            <div className="space-y-6">
              {artistData.reviews.map((review, index) => (
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
              {artistData.topTracks.map((track) => (
                <TrackItem
                  key={track.id}
                  id={track.id}
                  title={track.title}
                  artist={track.artist}
                  duration={track.duration}
                />
              ))}
            </div>
          </div>

          {/* Discography */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Discography</h3>
            <div className="grid grid-cols-3 gap-4">
              {artistData.discography.map((album) => (
                <AlbumCard
                  key={album.id}
                  id={album.id}
                  title={album.title}
                  artist={album.artist}
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