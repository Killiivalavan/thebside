import { useParams, Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/ReviewCard";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile, useUserReviews, useUserLists } from "@/hooks/useProfile";
import { useMyLists, useCreateList, useUpdateList, useDeleteList } from "@/hooks/useLists";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import { useItemsMetadata } from "@/hooks/useItemsMetadata";
import CreateListDialog from "@/components/CreateListDialog";
import { LogOut, Pencil, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useDisconnectSpotify, useSpotifyConnectionStatus, connectSpotify } from "@/hooks/useSpotify";
import { useFollowCounts, useFollowStatus, useFollowMutation } from "@/hooks/useFollow";

const FollowStats = ({ userId }: { userId: string }) => {
  const { data: stats } = useFollowCounts(userId);
  return (
    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
      <div><span className="font-semibold text-foreground">{stats?.followers || 0}</span> followers</div>
      <div><span className="font-semibold text-foreground">{stats?.following || 0}</span> following</div>
    </div>
  );
};

const FollowButton = ({ targetUserId }: { targetUserId: string }) => {
  const { data: isFollowing } = useFollowStatus(targetUserId);
  const { mutate, isPending } = useFollowMutation(targetUserId);

  return (
    <Button 
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={isFollowing ? "text-muted-foreground" : ""}
      disabled={isPending}
      onClick={() => mutate(!!isFollowing)}
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
};

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading: profileLoading, error: profileError } = useUserProfile(username);
  const { data: reviews, isLoading: reviewsLoading } = useUserReviews(profileData?.id || '');
  const { data: listsData, isLoading: listsLoadingFn } = useMyLists(1, 20);
  const { data: lists, isLoading: listsLoadingDb } = useUserLists(profileData?.id || '');

  // List CRUD hooks for own profile
  const createList = useCreateList();
  const updateList = useUpdateList();
  const deleteList = useDeleteList();

  // Spotify hooks
  const { data: isSpotifyConnected, isLoading: isSpotifyStatusLoading } = useSpotifyConnectionStatus();
  const disconnectSpotify = useDisconnectSpotify();

  // Local state for create list dialog

  // Local state for create list dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  // Listened: derive from user's reviews (deduplicated by item_id + item_type)
  const listenedItems = useMemo(() => {
    const seen = new Set<string>();
    const items: { item_id: string; item_type: string }[] = [];
    for (const r of (reviews || []) as any[]) {
      const key = `${r.item_type}:${r.item_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        items.push({ item_id: r.item_id, item_type: r.item_type });
      }
    }
    return items;
  }, [reviews]);

  // Check if this is the current user's profile using id match when data is available
  const isOwnProfile = Boolean(currentUser && profileData && currentUser.id === profileData.id);

  // Edit Profile dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [newUsername, setNewUsername] = useState<string>("");
  const [newBio, setNewBio] = useState<string>("");
  const [savingProfile, setSavingProfile] = useState(false);

  const openEdit = () => {
    setNewUsername(profileData?.username || "");
    setNewBio(profileData?.bio || "");
    setEditOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!profileData || !currentUser) return;
    const trimmedUsername = (newUsername || "").trim();
    if (!trimmedUsername) {
      toast({ title: 'Username required', description: 'Please enter a username.', variant: 'destructive' });
      return;
    }
    if (trimmedUsername.length < 3) {
      toast({ title: 'Username too short', description: 'Use at least 3 characters.', variant: 'destructive' });
      return;
    }
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ username: trimmedUsername, bio: newBio || null })
        .eq('id', currentUser.id);
      if (error) throw error;

      // Invalidate caches
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['user-profile', profileData.username] }),
        queryClient.invalidateQueries({ queryKey: ['user-profile', trimmedUsername] }),
        queryClient.invalidateQueries({ queryKey: ['current-user-profile'] }),
      ]);

      setEditOpen(false);
      toast({ title: 'Profile updated' });

      if (trimmedUsername !== profileData.username) {
        navigate(`/profile/${encodeURIComponent(trimmedUsername)}`);
      }
    } catch (e: any) {
      toast({ title: 'Update failed', description: e?.message || 'Could not update profile', variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

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
  const { data: listenedMetadataMap } = useItemsMetadata(listenedItems);

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
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="flex items-start space-x-6">
        <div className="w-32 h-32">
          <Avatar
            src={profileData.avatar_url}
            alt={profileData.username}
            size="xl"
            className="w-32 h-32 border-2 border-border"
          />
        </div>
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4 w-full">
            <div>
              <h2 className="text-3xl font-bold text-foreground break-all md:break-normal">
                {profileData.username}
              </h2>
              {/* Follow Counts */}
              <FollowStats userId={profileData.id} />
            </div>

            <div className="flex flex-row items-center gap-2 md:mt-0">
              {!isOwnProfile && currentUser && (
                <FollowButton targetUserId={profileData.id} />
              )}
              
              {isOwnProfile && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openEdit}
                    className="hover:bg-accent hover:text-accent-foreground transition-colors rounded-full w-10 h-10 p-0 md:w-auto md:h-9 md:px-3 md:rounded-md"
                    title="Edit Profile"
                  >
                    <Pencil className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Edit profile</span>
                  </Button>

                  {isSpotifyStatusLoading ? (
                    <Button variant="secondary" size="sm" disabled className="opacity-70 rounded-full w-10 h-10 p-0 md:w-auto md:h-9 md:px-3 md:rounded-md">
                      <span className="hidden md:inline">Loading...</span>
                    </Button>
                  ) : isSpotifyConnected ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={disconnectSpotify.isPending}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-full w-10 h-10 p-0 md:w-auto md:h-9 md:px-3 md:rounded-md"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to disconnect Spotify? You will lose personalized recommendations.")) {
                          disconnectSpotify.mutate(undefined, {
                            onSuccess: () => {
                              toast({ title: "Spotify Disconnected" });
                            },
                            onError: () => {
                              toast({ title: "Failed to disconnect", variant: "destructive" });
                            }
                          });
                        }
                      }}
                      title="Disconnect Spotify"
                    >
                      {disconnectSpotify.isPending ? (
                        <span className="hidden md:inline">Disconnecting...</span>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current md:mr-1.5" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
                          <span className="hidden md:inline">Disconnect</span>
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-[#1DB954] hover:text-[#1ed760] hover:bg-[#1DB954]/10 rounded-full w-10 h-10 p-0 md:w-auto md:h-9 md:px-3 md:rounded-md"
                      onClick={connectSpotify}
                      title="Connect Spotify"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current md:mr-1.5" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
                      <span className="hidden md:inline">Connect</span>
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            joined on {formatDate(profileData.created_at)}
          </p>
          {profileData.bio && (
            <p className="text-muted-foreground max-w-md truncate md:whitespace-normal md:overflow-visible">{profileData.bio}</p>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      {isOwnProfile && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="username">Username</label>
                <Input id="username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="yourname" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground" htmlFor="bio">Bio</label>
                <Textarea id="bio" value={newBio} onChange={(e) => setNewBio(e.target.value)} placeholder="Tell people a bit about you" rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditOpen(false)} disabled={savingProfile}>Cancel</Button>
              <Button onClick={handleSaveProfile} disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save changes'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
                <Button
                  size="sm"
                  variant={privacyFilter === 'all' ? 'secondary' : 'ghost'}
                  className={`text-xs ${privacyFilter === 'all' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`}
                  onClick={() => setPrivacyFilter('all')}
                >
                  ALL
                </Button>
                <Button
                  size="sm"
                  variant={privacyFilter === 'public' ? 'secondary' : 'ghost'}
                  className={`text-xs ${privacyFilter === 'public' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`}
                  onClick={() => setPrivacyFilter('public')}
                >
                  Public
                </Button>
                <Button
                  size="sm"
                  variant={privacyFilter === 'private' ? 'secondary' : 'ghost'}
                  className={`text-xs ${privacyFilter === 'private' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`}
                  onClick={() => setPrivacyFilter('private')}
                >
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
                        review={(review.review_text || '').trim()}
                        hideUserMeta
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
          {(listenedItems?.length || 0) > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {listenedItems.map((it: any) => {
                const key = `${it.item_type}:${it.item_id}`;
                const meta = listenedMetadataMap?.get(key);
                const href = it.item_type === 'album' ? `/album/${it.item_id}` : it.item_type === 'artist' ? `/artist/${it.item_id}` : `/track/${it.item_id}`;
                return (
                  <Link key={key} to={href} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                      {meta?.image_url && <img src={meta.image_url} alt={meta?.name || it.item_type} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-muted-foreground capitalize">{it.item_type}</div>
                      <div className="text-foreground truncate">{meta?.name || it.item_id}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">Nothing here yet</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;