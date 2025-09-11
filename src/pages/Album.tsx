import { useParams, Link } from "react-router-dom";
import { TrackItem } from "@/components/TrackItem";
import { ReviewCard } from "@/components/ReviewCard";

const Album = () => {
  const { id } = useParams();

  // Mock data - will be replaced with Spotify API calls
  const albumData = {
    id,
    title: "album name",
    artist: "artist 1",
    year: "2021",
    trackCount: 8,
    duration: "43 mins 29 secs",
    tracks: Array.from({ length: 8 }, (_, i) => ({
      id: `track-${i + 1}`,
      title: `track name`,
      artist: "artist 1, artist2",
      duration: "3:17",
    })),
    reviews: [
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
    ],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">album page</h1>
      </div>

      {/* Album Info */}
      <div className="flex space-x-8">
        <div className="w-48 h-48 bg-muted border-2 border-border rounded-lg flex-shrink-0"></div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">{albumData.title}</h2>
            <Link 
              to={`/artist/${albumData.artist.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-xl text-muted-foreground hover:text-foreground transition-colors"
            >
              {albumData.artist}
            </Link>
            <div className="text-muted-foreground mt-2">
              {albumData.year}
            </div>
            <div className="text-muted-foreground">
              {albumData.trackCount} tracks • {albumData.duration}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Track Listing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Track Listing</h3>
          <div className="space-y-2">
            {albumData.tracks.map((track) => (
              <TrackItem
                key={track.id}
                id={track.id}
                title={track.title}
                artist={track.artist}
                duration={track.duration}
                albumId={albumData.id}
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
            {albumData.reviews.map((review, index) => (
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