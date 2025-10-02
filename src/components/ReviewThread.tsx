
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { ReviewCard } from './ReviewCard';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Type for the flat data returned from our DB function
export type ReviewWithUser = {
  id: string;
  parent_id: string | null;
  created_at: string;
  review_text: string | null;
  rating: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  is_relisten?: boolean;
  is_private?: boolean;
  like_count: number;
  is_liked_by_me: boolean;
};

// The final nested structure that the component will receive
export type ReviewThread = ReviewWithUser & {
  children: ReviewThread[];
};

interface ReviewThreadProps {
  review: ReviewThread;
  item_id: string;
  item_type: 'album' | 'track' | 'artist';
  onReplySuccess: () => void; // Function to trigger a data refresh
}

export const ReviewThread = ({ review, item_id, item_type, onReplySuccess }: ReviewThreadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean>(review.is_liked_by_me);
  const [likeCount, setLikeCount] = useState<number>(review.like_count);

  const handleReplySubmit = async () => {
    if (!user || !replyText.trim()) return;

    setIsSubmitting(true);
    const { error } = await supabase.functions.invoke('create-review', {
      body: {
        item_id,
        item_type,
        review_text: replyText,
        rating: 0, // Replies don't have a rating
        parent_id: review.id,
      },
    });
    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Error submitting reply',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setReplyText('');
      setIsReplying(false);
      toast({
        title: 'Reply posted!',
      });
      onReplySuccess(); // Trigger refresh
    }
  };

  const handleDelete = async () => {
    if (!user || user.id !== review.user_id) return;
    const confirmDelete = window.confirm('Delete this comment and its replies?');
    if (!confirmDelete) return;

    setIsDeleting(true);
    const { error } = await supabase.rpc('delete_review', { p_review_id: review.id });
    setIsDeleting(false);

    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted' });
      onReplySuccess();
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast({ title: 'Please sign in to like reviews' });
      return;
    }
    if (likeBusy) return;
    setLikeBusy(true);

    // Optimistic update
    const prevLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!prevLiked);
    setLikeCount(prevCount + (prevLiked ? -1 : 1));

    const { data, error } = await supabase.rpc('toggle_review_like', { p_review_id: review.id });
    setLikeBusy(false);

    if (error) {
      // rollback
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      toast({ title: 'Failed to update like', description: error.message, variant: 'destructive' });
      return;
    }

    if (data && Array.isArray(data) && data[0]) {
      setIsLiked(Boolean(data[0].is_liked_by_me));
      setLikeCount(Number(data[0].like_count));
    }
  };

  return (
    <div className="flex flex-col">
      <ReviewCard
        username={review.username}
        rating={review.rating}
        review={review.review_text || ''}
        userAvatar={review.avatar_url || undefined}
        is_relisten={review.is_relisten}
        isLiked={isLiked}
        likeCount={likeCount}
        onToggleLike={handleToggleLike}
        likeBusy={likeBusy}
        onReplyClick={() => setIsReplying(!isReplying)}
        isReplying={isReplying}
        canDelete={Boolean(user && user.id === review.user_id)}
        onDelete={handleDelete}
        deleting={isDeleting}
      />
      {isReplying && (
        <div className="ml-4 mb-4 mt-2 space-y-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Replying to ${review.username}...`}
          />
          <Button onClick={handleReplySubmit} disabled={isSubmitting || !replyText.trim()}>
            {isSubmitting ? 'Posting...' : 'Post Reply'}
          </Button>
        </div>
      )}

      {review.children && review.children.length > 0 && (
        <div className="pl-6 border-l-2 border-border ml-4">
          {review.children.map((child) => (
            <ReviewThread
              key={child.id}
              review={child}
              item_id={item_id}
              item_type={item_type}
              onReplySuccess={onReplySuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
};
