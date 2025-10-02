import { useParams, Link } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/ReviewCard";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile, useUserReviews, useUserLists, useUserListeningHistory } from "@/hooks/useProfile";
import { useMyLists, useCreateList, useUpdateList, useDeleteList } from "@/hooks/useLists";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { useItemsMetadata } from "@/hooks/useItemsMetadata";
import CreateListDialog from "@/components/CreateListDialog";
import { Plus } from "lucide-react";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  
  const { data: profileData, isLoading: profileLoading, error: profileError } = useUserProfile(username);
  const { data: reviews, isLoading: reviewsLoading } = useUserReviews(profileData?.id || '');
  const { data: listsData, isLoading: listsLoadingFn } = useMyLists(1, 20);
  const { data: lists, isLoading: listsLoadingDb } = useUserLists(profileData?.id || '');

  // List CRUD hooks for own profile
  const createList = useCreateList();
  const updateList = useUpdateList();
  const deleteList = useDeleteList();

  // Local state for create list dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data: listeningHistory, isLoading: historyLoading } = useUserListeningHistory(profileData?.id || '');

  // Check if this is the current user's profile using id match when data is available
  const isOwnProfile = Boolean(currentUser && profileData && currentUser.id === profileData.id);

  // Privacy filter state for Activity tab
  const [privacyFilter, setPrivacyFilter] = useState<'all' | 'public' | 'private'>('all');

  // Compute filtered reviews based on privacy setting
  const filteredReviews = useMemo(() => {
    if (!reviews) return [] as any[];
    return reviews.filter((r: any) => {
      if (privacyFilter === 'all') return true;
      if (privacyFilter === 'public') return !r.is_private;
      return !!r.is_private;
    });
  }, [reviews, privacyFilter]);

  // Prepare unique item keys for metadata fetch
  const itemsForMetadata = useMemo(() => {
    const set = new Set<string>();
    const items: { item_id: string; item_type: string }[] = [];
    (reviews || []).forEach((r: any) => {
      const key = `${r.item_type}:${r.item_id}`;
      if (!set.has(key)) {
        set.add(key);
        items.push({ item_id: r.item_id, item_type: r.item_type });
      }
    });
    return items;
  }, [reviews]);

  const { data: metadataMap } = useItemsMetadata(itemsForMetadata);

  if (profileLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">profile/activity page</h1>
        </div>
        <div className="text-center text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (profileError || !profileData) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">profile/activity page</h1>
        </div>
        <div className="text-center text-red-500">Profile not found.</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">profile/activity page</h1>
      </div>

      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <div className="w-32 h-32">
          <Avatar 
            src={profileData.avatar_url} 
            alt={profileData.username}
            size="xl"
            className="w-32 h-32 border-2 border-border"
          />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">{profileData.username}</h2>
          <p className="text-muted-foreground">
            joined on {formatDate(profileData.created_at)}
          </p>
          {profileData.bio && (
            <p className="text-muted-foreground max-w-md">{profileData.bio}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
          <TabsTrigger value="list" className="flex-1">list</TabsTrigger>
          <TabsTrigger value="listened" className="flex-1">listened</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          {/* Privacy Filter - only show for own profile */}
          {isOwnProfile && (
            <div className="flex justify-end">
              <div className="flex space-x-2 bg-card border border-border rounded-lg p-1">
                <Button size="sm" variant={privacyFilter === 'all' ? 'secondary' : 'ghost'} className="text-xs" onClick={() => setPrivacyFilter('all')}>
                  ALL
                </Button>
                <Button size="sm" variant={privacyFilter === 'public' ? 'secondary' : 'ghost'} className="text-xs" onClick={() => setPrivacyFilter('public')}>
                  Public
                </Button>
                <Button size="sm" variant={privacyFilter === 'private' ? 'secondary' : 'ghost'} className="text-xs" onClick={() => setPrivacyFilter('private')}>
                  Private
                </Button>
              </div>
            </div>
          )}

          {/* Activity Feed - Reviews */}
          {reviewsLoading ? (
            <div className="text-center text-muted-foreground">Loading reviews...</div>
          ) : filteredReviews && filteredReviews.length > 0 ? (
            <div className="space-y-6">
              {filteredReviews.map((review: any) => {
                const key = `${review.item_type}:${review.item_id}`;
                const meta = metadataMap?.get(key);
                const href = `/${review.item_type}/${review.item_id}`;
                return (
                  <Link key={review.id} to={href} className="flex space-x-4">
                    <div className="w-16 h-16 bg-muted border border-border rounded-lg flex-shrink-0 overflow-hidden">
                      {meta?.image_url ? (
                        <img src={meta.image_url} alt={meta.name || review.item_type} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-muted-foreground mb-1 capitalize">
                        {review.item_type} • {new Date(review.created_at).toLocaleDateString()}
                      </div>
                      <ReviewCard
                        username={profileData.username}
                        rating={review.rating}
                        review={review.review_text || `Rated this ${review.item_type}`}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No reviews yet. Start exploring music to leave your first review!
            </div>
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          {(isOwnProfile ? listsLoadingFn : listsLoadingDb) ? (
            <div className="text-center text-muted-foreground">Loading lists...</div>
          ) : (
            (() => {
              const renderLists = () => {
                if (isOwnProfile) {
                  const myLists = listsData?.lists || [];
                  return myLists;
                }
                return lists || [];
              };
              const listsToRender = renderLists();
              return (
            <>
            <div className="space-y-6">
              {isOwnProfile && (
                <div className="flex justify-end">
                  <Button variant="secondary" size="icon" className="rounded-full" aria-label="Create list" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {(!listsToRender || listsToRender.length === 0) && (
                <div className="text-center text-muted-foreground">No lists yet. Get started by creating your first list.</div>
              )}
              {listsToRender.map((list: any) => (
                <Link key={list.id} to={`/list/${list.id}`} className="block border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-foreground">{list.name}</h3>
                      {list.description && (
                        <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {typeof list.items_count === 'number' ? list.items_count : (Array.isArray(list.list_items) ? (list.list_items?.length || 0) : 0)} items
                    </div>
                  </div>
                  {/* Hide item previews on profile; details should be inside the list page */}
                </Link>
              ))}
            </div>
            <CreateListDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
            </>
              );
            })()
          )}
        </TabsContent>

        <TabsContent value="listened" className="space-y-6">
          {historyLoading ? (
            <div className="text-center text-muted-foreground">Loading listening history...</div>
          ) : listeningHistory && listeningHistory.length > 0 ? (
            <div className="space-y-4">
              {listeningHistory.map((item: any) => (
                <div key={item.id} className="flex space-x-4 p-3 border border-border rounded-lg">
                  <div className="w-12 h-12 bg-muted border border-border rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-1">
                    <div className="text-sm text-muted-foreground capitalize">{item.item_type}</div>
                    <h3 className="font-medium text-foreground">Item ID: {item.item_id}</h3>
                    <p className="text-xs text-muted-foreground">
                      Listened on {new Date(item.listened_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No listening history yet. Start listening to music to build your history!
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;