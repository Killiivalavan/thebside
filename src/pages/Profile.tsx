import { useParams, Navigate } from "react-router-dom";
import { User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/ReviewCard";
import { ProfileEditDialog } from "@/components/ProfileEditDialog";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/contexts/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [lists, setLists] = useState<any[]>([]);
  const [listenedItems, setListenedItems] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // First, find the user ID by username
  useEffect(() => {
    const findUserByUsername = async () => {
      if (!username) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single();

        if (error) {
          console.error('Error finding user:', error);
          setError('User not found');
          return;
        }

        setUserId(data.id);
      } catch (err) {
        console.error('Unexpected error finding user:', err);
        setError('Failed to load user');
      }
    };

    findUserByUsername();
  }, [username]);

  // Fetch user profile data
  const { profile, isLoading: profileLoading, error: profileError, refreshProfile } = useUserProfile(userId || undefined);

  // Refresh profile data when needed
  const handleProfileUpdate = () => {
    refreshProfile();
  };

  // Fetch user's reviews, lists, and listened items
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      try {
        setIsLoadingData(true);
        setError(null);

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            id,
            item_id,
            item_type,
            rating,
            review_text,
            is_private,
            is_relisten,
            created_at
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (reviewsError) {
          console.error('Error fetching reviews:', reviewsError);
        } else {
          setReviews(reviewsData || []);
        }

        // Fetch lists
        const { data: listsData, error: listsError } = await supabase
          .from('lists')
          .select(`
            id,
            name,
            description,
            created_at
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (listsError) {
          console.error('Error fetching lists:', listsError);
        } else {
          setLists(listsData || []);
        }

        // Fetch listened items
        const { data: listenedData, error: listenedError } = await supabase
          .from('listened_log')
          .select(`
            id,
            item_id,
            item_type,
            listened_at
          `)
          .eq('user_id', userId)
          .order('listened_at', { ascending: false })
          .limit(20);

        if (listenedError) {
          console.error('Error fetching listened items:', listenedError);
        } else {
          setListenedItems(listenedData || []);
        }
      } catch (err) {
        console.error('Unexpected error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Handle errors
  if (error || profileError) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-semibold text-foreground mb-4">Profile Not Found</h1>
        <p className="text-muted-foreground mb-6">
          {error || profileError || "The user you're looking for doesn't exist."}
        </p>
        <Button asChild>
          <a href="/discover">Go to Discover</a>
        </Button>
      </div>
    );
  }

  // Handle loading
  if (profileLoading || !profile) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Avatar className="w-32 h-32 border-2 border-border">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
            <AvatarFallback className="text-4xl">
              {profile.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">{profile.username}</h2>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              <span>joined on {formatJoinDate(profile.created_at)}</span>
            </div>
            {profile.bio && (
              <p className="text-foreground mt-2">{profile.bio}</p>
            )}
          </div>
        </div>
        
        {/* Edit Profile Button - only show if viewing own profile */}
        {currentUser && currentUser.id === profile.id && (
          <ProfileEditDialog
            currentUsername={profile.username}
            currentBio={profile.bio}
            onProfileUpdate={handleProfileUpdate}
          />
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="w-full">
          <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
          <TabsTrigger value="list" className="flex-1">list</TabsTrigger>
          <TabsTrigger value="listened" className="flex-1">listened</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          {/* Privacy Filter */}
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

          {/* Activity Feed */}
          <div className="space-y-6">
            {isLoadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading activity...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reviews yet</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="flex space-x-4">
                  <div className="w-16 h-16 bg-muted border border-border rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1 capitalize">
                      {review.item_type}
                      {review.is_relisten && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Relisten</span>}
                    </div>
                    <ReviewCard
                      username={profile.username}
                      rating={review.rating}
                      review={review.review_text || "No review text"}
                      userAvatar={profile.avatar_url || undefined}
                    />
                    <div className="text-xs text-muted-foreground mt-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <div className="space-y-6">
            {isLoadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading lists...</p>
              </div>
            ) : lists.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No lists created yet</p>
              </div>
            ) : (
              lists.map((list) => (
                <div key={list.id} className="flex space-x-4">
                  <div className="w-16 h-16 bg-muted border border-border rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium text-foreground">{list.name}</h3>
                    {list.description && (
                      <p className="text-sm text-muted-foreground">{list.description}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(list.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="listened" className="space-y-6">
          <div className="space-y-6">
            {isLoadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading listened items...</p>
              </div>
            ) : listenedItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No items logged yet</p>
              </div>
            ) : (
              listenedItems.map((item) => (
                <div key={item.id} className="flex space-x-4">
                  <div className="w-16 h-16 bg-muted border border-border rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-1">
                    <div className="text-sm text-muted-foreground capitalize">{item.item_type}</div>
                    <h3 className="font-medium text-foreground">{item.item_id}</h3>
                    <div className="text-xs text-muted-foreground">
                      Listened {new Date(item.listened_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;