import { useParams } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/ReviewCard";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile, useUserReviews, useUserLists, useUserListeningHistory } from "@/hooks/useProfile";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  
  const { data: profileData, isLoading: profileLoading, error: profileError } = useUserProfile(username);
  const { data: reviews, isLoading: reviewsLoading } = useUserReviews(profileData?.id || '');
  const { data: lists, isLoading: listsLoading } = useUserLists(profileData?.id || '');
  const { data: listeningHistory, isLoading: historyLoading } = useUserListeningHistory(profileData?.id || '');

  // Check if this is the current user's profile
  const isOwnProfile = currentUser?.email?.split('@')[0] === username || 
                      currentUser?.user_metadata?.username === username;

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
          {listsLoading ? (
            <div className="text-center text-muted-foreground">Loading lists...</div>
          ) : lists && lists.length > 0 ? (
            <div className="space-y-6">
              {lists.map((list: any) => (
                <div key={list.id} className="border border-border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-foreground">{list.name}</h3>
                      {list.description && (
                        <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {list.list_items?.length || 0} items
                    </div>
                  </div>
                  {list.list_items && list.list_items.length > 0 ? (
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
                      {list.list_items.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{list.list_items.length - 3} more items
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Empty list</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No lists created yet. Create your first list to organize your favorite music!
            </div>
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