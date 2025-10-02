import { Star, User, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReviewCardProps {
  username: string;
  rating?: number | null;
  review: string;
  userAvatar?: string;
  is_relisten?: boolean;
  isLiked?: boolean;
  likeCount?: number;
  onToggleLike?: () => void;
  likeBusy?: boolean;
}

export const ReviewCard = ({ username, rating, review, userAvatar, is_relisten, isLiked, likeCount, onToggleLike, likeBusy }: ReviewCardProps) => {
  return (
    <div className="border-b border-border pb-4 mb-4 last:border-b-0">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
          {userAvatar ? (
            <img src={userAvatar} alt={username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-medium text-foreground">{username}</span>
            {is_relisten && <Badge variant="outline">Relisten</Badge>}
            {typeof rating === 'number' && rating > 0 && (
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= (rating || 0)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          
          <p className="text-sm text-foreground leading-relaxed">{review}</p>
          
          {onToggleLike && (
            <button
              type="button"
              aria-pressed={Boolean(isLiked)}
              disabled={likeBusy}
              onClick={onToggleLike}
              className={`mt-2 inline-flex items-center gap-1 text-xs transition-colors ${
                isLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"
              } ${likeBusy ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-primary" : ""}`} />
              <span>{likeCount ?? 0}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};