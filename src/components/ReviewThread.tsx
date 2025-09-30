
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

  return (
    <div className="flex flex-col">
      <ReviewCard
        username={review.username}
        rating={review.rating}
        review={review.review_text || ''}
        userAvatar={review.avatar_url || undefined}
        is_relisten={review.is_relisten}
      />
      <div className="ml-4 mb-4 flex items-center gap-2">
        {user && (
          <Button variant="ghost" size="sm" onClick={() => setIsReplying(!isReplying)}>
            {isReplying ? 'Cancel' : 'Reply'}
          </Button>
        )}
        {user && user.id === review.user_id && (
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        )}

        {isReplying && (
          <div className="mt-2 space-y-2">
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
      </div>

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
