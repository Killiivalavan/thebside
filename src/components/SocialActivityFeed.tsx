import { useSocialActivity } from "@/hooks/useFollow";
import { Link } from "react-router-dom";
// import { ReviewCard } from "@/components/ReviewCard"; // Removing unused
import { Avatar } from "@/components/Avatar";
import { useItemsMetadata } from "@/hooks/useItemsMetadata";
import { useMemo } from "react";
import { Star as StarIcon } from "lucide-react";

export function SocialActivityFeed() {
  const { data: activity, isLoading } = useSocialActivity();

  const itemsToFetch = useMemo(() => {
    if (!activity) return [];
    return activity
      .filter((a: any) => a.type === 'review')
      .map((a: any) => ({ item_id: a.item_id, item_type: a.item_type }));
  }, [activity]);

  const { data: metadataMap } = useItemsMetadata(itemsToFetch);

  if (isLoading || !activity || activity.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Recent activities from people you know
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activity.map((item: any) => {
          const isReview = item.type === 'review';
          const user = item.user;
          const meta = metadataMap?.get(`${item.item_type}:${item.item_id}`);
          const displayName = meta?.name || item.item_type;
          const imageUrl = meta?.image_url;
          
          if (isReview) {
            return (
              <div key={`review-${item.id}`} className="relative flex gap-4 p-4 border border-border/40 rounded-lg hover:border-primary/50 transition-colors bg-card/30 group">
                <Link to={`/${item.item_type}/${item.item_id}`} className="absolute inset-0 z-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" aria-label={`View ${displayName}`} />
                
                {/* Poster / Left Col */}
                <div className="flex-shrink-0 w-20 relative pointer-events-none">
                  <div className="aspect-square bg-muted rounded overflow-hidden shadow-sm group-hover:ring-2 ring-primary/50 transition-all">
                    {imageUrl ? (
                      <img src={imageUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted/50 p-2 text-center">
                        {item.item_type}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content / Right Col */}
                <div className="flex-1 min-w-0 relative pointer-events-none">
                  <div className="flex flex-col gap-1">
                     {/* Title & Stats */}
                     <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                          {displayName}
                        </span>
                        {/* Rating */}
                        {item.rating > 0 && (
                          <div className="flex items-center gap-0.5 text-primary">
                             {[1, 2, 3, 4, 5].map((star) => (
                                <StarIcon 
                                  key={star} 
                                  className={`w-3 h-3 ${star <= item.rating ? "fill-current" : "text-muted-foreground/30 fill-none"}`} 
                                />
                             ))}
                          </div>
                        )}
                     </div>
                     
                     {/* User Info Line - Clickable */}
                     <div className="flex items-center gap-2 pb-2 pointer-events-auto">
                        <Link to={`/profile/${user.username}`} className="relative z-10 flex items-center gap-2 group/user">
                          <Avatar src={user.avatar_url} alt={user.username} className="w-4 h-4" />
                          <span className="text-xs font-medium text-muted-foreground group-hover/user:text-foreground transition-colors">
                            {user.username}
                          </span>
                        </Link>
                     </div>

                     {/* Review Text */}
                     {item.review_text && (
                       <div className="text-sm text-foreground/90 leading-relaxed max-w-none line-clamp-3">
                         {item.review_text}
                       </div>
                     )}
                  </div>
                </div>
              </div>
            );
          } else {
             // List
             return (
              <div key={`list-${item.id}`} className="relative flex gap-4 p-4 border border-border/40 rounded-lg hover:border-primary/50 transition-colors bg-card/30 group">
                <Link to={`/list/${item.id}`} className="absolute inset-0 z-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" aria-label={`View ${item.name}`} />
                
                <div className="flex-shrink-0 w-20 aspect-square bg-muted rounded overflow-hidden flex items-center justify-center p-2 text-center text-xs text-muted-foreground shadow-sm relative pointer-events-none">
                   List
                </div>
                <div className="flex-1 min-w-0 relative pointer-events-none">
                  <div className="flex flex-col gap-1">
                     <span className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                       {item.name}
                     </span>
                     
                     <div className="flex items-center gap-2 pb-2 pointer-events-auto">
                        <Link to={`/profile/${user.username}`} className="relative z-10 flex items-center gap-2 group/user">
                          <Avatar src={user.avatar_url} alt={user.username} className="w-4 h-4" />
                          <span className="text-xs font-medium text-muted-foreground group-hover/user:text-foreground transition-colors">
                            {user.username}
                          </span>
                        </Link>
                     </div>

                     {item.description && (
                       <div className="text-sm text-foreground/80 leading-relaxed mb-2 line-clamp-2">
                         {item.description}
                       </div>
                     )}
                     
                     <div className="text-xs text-muted-foreground bg-muted/40 px-2 py-1 rounded w-fit">
                       {item.list_items ? item.list_items.length : 0} items
                     </div>
                  </div>
                </div>
              </div>
             );
          }
        })}
      </div>
    </section>
  );
}
