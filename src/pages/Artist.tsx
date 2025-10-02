
import { useParams, Link } from "react-router-dom";
import { TrackItem } from "@/components/TrackItem";
import { AlbumCard } from "@/components/AlbumCard";
import { ReviewThread, ReviewThread as ReviewThreadType } from "@/components/ReviewThread";
import { useSpotifyArtist } from "@/hooks/useSpotify";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Star, Plus } from "lucide-react";
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
import CreateListDialog from "@/components/CreateListDialog";

const Artist = () => {
  const { id } = useParams<{ id: string }>();
  const { data: artistData, isLoading, error, refetch } = useSpotifyArtist(id!);
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: myListsData } = useMyLists(1, 50);
  const addItemMutation = useAddListItem();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRelisten, setIsRelisten] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showAllAlbums, setShowAllAlbums] = useState(false);

  const handleReviewSubmit = async () => {
    if (!user || (!reviewText.trim() && rating === 0)) {
      toast({ title: 'Error', description: 'Please provide a rating or write a review.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.functions.invoke('create-review', {
      body: {
        item_id: id,
        item_type: 'artist',
        review_text: reviewText,
        rating: rating > 0 ? rating : null,
        is_relisten: isRelisten,
        is_private: isPrivate,
      },
    });
    setIsSubmitting(false);

    if (error) {
      toast({ title: 'Error submitting review', description: error.message, variant: 'destructive' });
    } else {
      setReviewText('');
      setRating(0);
      setIsRelisten(false);
      setIsPrivate(false);
      toast({ title: 'Review posted!' });
      refetch();
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (error || !artistData) {
    return <div>Error: {error?.message || "Artist not found"}</div>;
  }

  const reviews: ReviewThreadType[] = artistData?.reviews || [];

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">artist page</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column wrapper: Artist Info + Top Tracks + Discography */}
        <div className="space-y-8 order-1 lg:order-1 lg:col-start-1">
          <div className="flex space-x-6">
            <div className="w-32 h-32 bg-muted border-2 border-border rounded-full flex-shrink-0 overflow-hidden">
              {artistData.images?.[0]?.url && (
                <img src={artistData.images[0].url} alt={artistData.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">{artistData.name}</h2>
              <p className="text-muted-foreground">{artistData.followers?.total?.toLocaleString()} followers</p>
              {user && (
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="rounded-full" aria-label="Add to list">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                      {myListsData?.lists?.length ? (
                        myListsData.lists.map((list: any) => (
                          <DropdownMenuItem
                            key={list.id}
                            onClick={async () => {
                              try {
                                await addItemMutation.mutateAsync({ list_id: list.id, item_id: id!, item_type: 'artist' });
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
                      <DropdownMenuItem onClick={() => setCreateDialogOpen(true)}>Create new list…</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>

          <CreateListDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} autoAddItem={{ item_id: id!, item_type: 'artist' }} />

          {/* Top Tracks */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Popular Tracks</h3>
            <div className="space-y-2">
              {artistData.top_tracks?.slice(0, 5).map((track: any) => (
                <TrackItem key={track.id} id={track.id} title={track.name} artist={track.artists?.map((a: any) => a.name).join(", ")} artistId={track.artists?.[0]?.id} duration={formatDuration(track.duration_ms)} />
              ))}
            </div>
          </div>

          {/* Discography */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Discography</h3>
            <div className="grid grid-cols-3 gap-4">
              {artistData.albums_list?.slice(0, showAllAlbums ? artistData.albums_list.length : 6).map((album: any) => (
                <AlbumCard key={album.id} id={album.id} title={album.name} artist={album.artists?.[0]?.name} artistId={album.artists?.[0]?.id} imageUrl={album.images?.[0]?.url} size="md" />
              ))}
            </div>
            {artistData.albums_list && artistData.albums_list.length > 6 && (
              <div>
                <Button variant="link" size="sm" className="px-0" onClick={() => setShowAllAlbums(v => !v)}>
                  {showAllAlbums ? 'See less' : 'See more'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews (last on mobile; right column top on desktop) */}
        <div className="space-y-4 order-4 lg:order-1 lg:col-start-2">
          <h3 className="text-lg font-semibold text-foreground">Reviews</h3>
          {user && (
            <div className="space-y-4 p-4 border rounded-lg">
              {/* Top row: Star rating (left) and Private (right) */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(prev => prev === star ? 0 : star)} className="focus:outline-none">
                      <Star className={`w-6 h-6 transition-colors ${rating >= star ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'}`} />
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="isPrivate" checked={isPrivate} onCheckedChange={setIsPrivate} />
                  <Label htmlFor="isPrivate">Private</Label>
                </div>
              </div>

              <Textarea placeholder="Write a review..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="bg-transparent" />

              {/* Bottom row: Relisten (left) and Submit button (right) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="isRelisten" checked={isRelisten} onCheckedChange={(checked) => setIsRelisten(Boolean(checked))} />
                  <Label htmlFor="isRelisten">Relisten</Label>
                </div>
                <Button onClick={handleReviewSubmit} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</Button>
              </div>
            </div>
          )}
          <div className="space-y-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewThread key={review.id} review={review} item_id={id!} item_type="artist" onReplySuccess={refetch} />
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

export default Artist;