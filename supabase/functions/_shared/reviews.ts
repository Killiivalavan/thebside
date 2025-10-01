
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Type for the flat data returned from the database function
export interface Review {
  id: string;
  parent_id: string | null;
  created_at: string;
  review_text: string;
  rating: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
  is_relisten?: boolean;
  is_private?: boolean;
  like_count: number; // aggregated like count
  is_liked_by_me: boolean; // caller's like state
}

// Type for the nested structure we want to create
export interface ReviewThread extends Review {
  children: ReviewThread[];
}

export async function fetchAndStructureReviewThreads(supabase: SupabaseClient, itemId: string): Promise<ReviewThread[]> {
  // 1. Call the database function
  const { data: reviews, error } = await supabase.rpc('get_review_threads_for_item', {
    p_item_id: itemId,
  });

  if (error) {
    console.error('Error fetching review threads:', error);
    throw new Error(error.message);
  }

  if (!reviews) {
    return [];
  }

  // 2. Structure the flat list into a tree
  const reviewMap = new Map<string, ReviewThread>();
  const rootReviews: ReviewThread[] = [];

  // First pass: initialize and map each review
  for (const review of reviews as Review[]) {
    reviewMap.set(review.id, { ...review, children: [] });
  }

  // Second pass: link children to their parents
  for (const review of reviewMap.values()) {
    if (review.parent_id && reviewMap.has(review.parent_id)) {
      reviewMap.get(review.parent_id)!.children.push(review);
    } else {
      rootReviews.push(review);
    }
  }

  return rootReviews;
}
