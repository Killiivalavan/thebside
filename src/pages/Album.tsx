import { useParams, Link } from "react-router-dom";
import { TrackItem } from "@/components/TrackItem";
import { ReviewThread, ReviewThread as ReviewThreadType } from "@/components/ReviewThread"; // Import component and type
import { useSpotifyAlbum } from "@/hooks/useSpotify";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";

const Album = () => {
  const { id } = useParams<{ id: string }>();
  const { data: albumData, isLoading, error, refetch } = useSpotifyAlbum(id!);
  const { user } = useAuth();
  const { toast } = useToast();

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewSubmit = async () => {
    if (!user || !reviewText.trim() || rating === 0) {
      toast({
        title: 'Error',
        description: 'Please write a review and select a rating.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.functions.invoke('create-review', {
      body: {
        item_id: id,
        item_type: 'album',
        review_text: reviewText,
        rating: rating,
      },
    });
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Error submitting review',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setReviewText('');
      setRating(0);
      toast({
        title: 'Review posted!',
      });
      refetch(); // Refetch data to show the new review
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  // The data from the hook now contains a 'reviews' property
  const reviews: ReviewThreadType[] = albumData?.reviews || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">album page</h1>
      </div>

      {/* Album Info */}
      <div className="flex space-x-8">
        <img src={albumData.images[0].url} alt={albumData.name} className="w-48 h-48 bg-muted border-2 border-border rounded-lg flex-shrink-0" />
        
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">{albumData.name}</h2>
            <Link 
              to={`/artist/${albumData.artists[0].id}`}
              className="text-xl text-muted-foreground hover:text-foreground transition-colors"
            >
              {albumData.artists[0].name}
            </Link>
            <div className="text-muted-foreground mt-2">
              {new Date(albumData.release_date).getFullYear()}
            </div>
            <div className="text-muted-foreground">
              {albumData.total_tracks} tracks
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Track Listing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Track Listing</h3>
          <div className="space-y-2">
            {albumData.tracks.items.map((track: any) => (
              <TrackItem
                key={track.id}
                id={track.id}
                title={track.name}
                artist={track.artists.map((a: any) => a.name).join(', ')}
                artistId={track.artists[0].id}
                duration={new Date(track.duration_ms).toISOString().substr(14, 5)}
                albumId={albumData.id}
              />
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Reviews</h3>
          </div>

          {/* Form to write a new top-level review */}
          {user && (
            <div className="space-y-2 p-4 border rounded-lg">
              <Textarea 
                placeholder="Write a review..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="bg-transparent border-0 focus:ring-0 px-0"
              />
              <div className="flex items-center justify-between pt-2 border-t">
                {/* Simple star rating */}
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(star)} className="focus:outline-none">
                      <Star className={`w-6 h-6 transition-colors ${rating >= star ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'}`} />
                    </button>
                  ))}
                </div>
                <Button onClick={handleReviewSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewThread
                  key={review.id}
                  review={review}
                  item_id={id!}
                  item_type="album"
                  onReplySuccess={refetch}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Album;