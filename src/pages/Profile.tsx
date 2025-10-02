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
import { useState } from "react";

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

  // Local state for creating a new list
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const { toast } = useToast();
  const { data: listeningHistory, isLoading: historyLoading } = useUserListeningHistory(profileData?.id || '');

  // Check if this is the current user's profile using id match when data is available
  const isOwnProfile = Boolean(currentUser && profileData && currentUser.id === profileData.id);

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
                <Button size="sm" variant="secondary" className="text-xs">
                  ALL
                </Button>
                <Button size="sm" variant="ghost" className="text-xs">
                  Public
                </Button>
                <Button size="sm" variant="ghost" className="text-xs">
                  Private
                </Button>
              </div>
            </div>
          )}

          {/* Activity Feed - Reviews */}
          {reviewsLoading ? (
            <div className="text-center text-muted-foreground">Loading reviews...</div>
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review: any) => (
                <div key={review.id} className="flex space-x-4">
                  <div className="w-16 h-16 bg-muted border border-border rounded-lg flex-shrink-0"></div>
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
                </div>
              ))}
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
            <div className="space-y-6">
              {isOwnProfile && (
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-3">Create a list</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="List name"
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      className="bg-transparent"
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newListDescription}
                      onChange={(e) => setNewListDescription(e.target.value)}
                      className="bg-transparent"
                    />
                    <Button
                      disabled={createList.isPending || !newListName.trim()}
                      onClick={async () => {
                        try {
                          await createList.mutateAsync({ name: newListName.trim(), description: newListDescription.trim() || undefined });
                          setNewListName('');
                          setNewListDescription('');
                          toast({ title: 'List created' });
                        } catch (e: any) {
                          toast({ title: 'Failed to create list', description: e?.message || 'Please try again', variant: 'destructive' });
                        }
                      }}
                    >
                      {createList.isPending ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </div>
              )}
              {listsToRender.map((list: any) => (
                <div key={list.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-foreground">{list.name}</h3>
                      {list.description && (
                        <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-muted-foreground">
                        {Array.isArray(list.list_items) ? (list.list_items?.length || 0) : 0} items
                      </div>
                      {isOwnProfile && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              const nextName = window.prompt('Rename list', list.name)?.trim();
                              if (!nextName) return;
                              try {
                                await updateList.mutateAsync({ list_id: list.id, name: nextName });
                                toast({ title: 'List renamed' });
                              } catch (e: any) {
                                toast({ title: 'Failed to rename list', description: e?.message || 'Please try again', variant: 'destructive' });
                              }
                            }}
                          >
                            Rename
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              const ok = window.confirm('Delete this list?');
                              if (!ok) return;
                              try {
                                await deleteList.mutateAsync({ list_id: list.id });
                                toast({ title: 'List deleted' });
                              } catch (e: any) {
                                toast({ title: 'Failed to delete list', description: e?.message || 'Please try again', variant: 'destructive' });
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {Array.isArray(list.list_items) && list.list_items.length > 0 ? (
                    <div className="space-y-2">
                      {list.list_items.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="flex space-x-3 text-sm">
                          <div className="w-8 h-8 bg-muted rounded flex-shrink-0"></div>
                          <div>
                            <div className="text-muted-foreground capitalize">{item.item_type}</div>
                            <div className="font-medium">Item ID: {item.item_id}</div>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between">
                        {list.list_items.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{list.list_items.length - 3} more items
                          </div>
                        )}
                        <Link to={`/list/${list.id}`} className="text-xs text-primary">Open list</Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">No music added</div>
                      <Link to={`/list/${list.id}`} className="text-xs text-primary">Open list</Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
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