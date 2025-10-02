
import { useParams, Link } from "react-router-dom";
import { ReviewThread, ReviewThread as ReviewThreadType } from "@/components/ReviewThread";
import { useSpotifyTrack } from "@/hooks/useSpotify";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Star } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMyLists } from "@/hooks/useLists";
import { useAddListItem } from "@/hooks/useListItems";

const Track = () => {
  const { id } = useParams<{ id: string }>();
  const { data: trackData, isLoading, error, refetch } = useSpotifyTrack(id!);
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: myListsData } = useMyLists(1, 50);
  const addItemMutation = useAddListItem();

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRelisten, setIsRelisten] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

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
        item_type: 'track',
        review_text: reviewText,
        rating: rating,
        is_relisten: isRelisten,
        is_private: isPrivate,
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
      setIsRelisten(false);
      setIsPrivate(false);
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

  if (error || !trackData) {
    return <div>Error: {error?.message || "Track not found"}</div>;
  }

  const reviews: ReviewThreadType[] = trackData?.reviews || [];

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes} mins ${seconds} secs`;
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
              {user && (
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm">Add to list</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {myListsData?.lists?.length ? (
                        myListsData.lists.map((list: any) => (
                          <DropdownMenuItem
                            key={list.id}
                            onClick={async () => {
                              try {
                                await addItemMutation.mutateAsync({ list_id: list.id, item_id: id!, item_type: 'track' });
                                toast({ title: 'Added to list', description: `Added to ${list.name}` });
                              } catch (e: any) {
                                toast({ title: 'Failed to add', description: e?.message || 'Unable to add to list', variant: 'destructive' });
                              }
                            }}
                          >
                            {list.name}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">No lists found</div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Reviews */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Reviews</h3>
          </div>

          {user && (
            <div className="space-y-4 p-4 border rounded-lg">
              <Textarea 
                placeholder="Write a review..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="bg-transparent"
              />
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="isRelisten" checked={isRelisten} onCheckedChange={(checked) => setIsRelisten(Boolean(checked))} />
                    <Label htmlFor="isRelisten">Relisten</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="isPrivate" checked={isPrivate} onCheckedChange={setIsPrivate} />
                    <Label htmlFor="isPrivate">Private</Label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
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
                  item_type="track"
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

export default Track;