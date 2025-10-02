import { Star, User, Heart, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

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
  // Inline actions
  onReplyClick?: () => void;
  isReplying?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
  deleting?: boolean;
  hideUserMeta?: boolean;
}

export const ReviewCard = ({ username, rating, review, userAvatar, is_relisten, isLiked, likeCount, onToggleLike, likeBusy, onReplyClick, isReplying, canDelete, onDelete, deleting, hideUserMeta }: ReviewCardProps) => {
  return (
    <div className="border-b border-border pb-4 mb-4 last:border-b-0">
      <div className={`flex items-start ${hideUserMeta ? '' : 'space-x-3'}`}>
        {!hideUserMeta && (
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
            {userAvatar ? (
              <img src={userAvatar} alt={username} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {!hideUserMeta && <span className="font-medium text-foreground">{username}</span>}
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

            {canDelete && onDelete && (
              <div className="ml-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      {deleting ? 'Deleting…' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          {review?.trim() ? (
            <p className="text-sm text-foreground leading-relaxed">{review}</p>
          ) : null}

          <div className="mt-2 flex items-center gap-2">
            {onToggleLike && (
              <button
                type="button"
                aria-pressed={Boolean(isLiked)}
                disabled={likeBusy}
                onClick={onToggleLike}
                className={`inline-flex items-center gap-1 text-xs transition-colors ${
                  isLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                } ${likeBusy ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-primary" : ""}`} />
                <span>{likeCount ?? 0}</span>
              </button>
            )}

            {onReplyClick && (
              <Button variant="ghost" size="sm" onClick={onReplyClick} className="h-7 px-2 text-xs">
                {isReplying ? 'Cancel' : 'Reply'}
              </Button>
            )}

            {/* overflow spacer to keep actions aligned; menu moved to header */}
          </div>
        </div>
      </div>
    </div>
  );
};