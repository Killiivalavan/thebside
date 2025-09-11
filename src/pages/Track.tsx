import { useParams, Link } from "react-router-dom";
import { ReviewCard } from "@/components/ReviewCard";

const Track = () => {
  const { id } = useParams();

  // Mock data - will be replaced with Spotify API calls
  const trackData = {
    id,
    title: "track name",
    artist: "artist 1, artist2",
    year: "2021",
    duration: "3mins 29 secs",
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
        <h1 className="text-2xl font-semibold text-foreground">track page</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Track Info */}
        <div className="space-y-6">
          <div className="flex space-x-6">
            <div className="w-48 h-48 bg-muted border-2 border-border rounded-lg flex-shrink-0"></div>
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">{trackData.title}</h2>
                <Link 
                  to={`/artist/${trackData.artist.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  {trackData.artist}
                </Link>
              </div>
              <div className="text-muted-foreground space-y-1">
                <div>{trackData.year}</div>
                <div>{trackData.duration}</div>
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
            {trackData.reviews.map((review, index) => (
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