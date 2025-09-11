import { useParams } from "react-router-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/ReviewCard";

const Profile = () => {
  const { username } = useParams();
  
  // Mock data - will be replaced with Supabase calls
  const profileData = {
    username: username || "username",
    joinDate: "29-02-2024",
    activities: [
      {
        type: "album",
        title: "Album",
        subtitle: "blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah",
        rating: 5,
        isPublic: true,
      },
      {
        type: "track",
        title: "Track",
        subtitle: "blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah blah",
        rating: 4,
        isPublic: false,
      },
    ],
    list: [
      {
        type: "album",
        title: "album name",
        artist: "artist 1, artist2",
      },
      {
        type: "track",
        title: "track name", 
        artist: "artist 1, artist2",
      },
    ],
    listened: [
      {
        type: "album",
        title: "album name",
        artist: "artist 1, artist2",
      },
      {
        type: "track",
        title: "track name",
        artist: "artist 1, artist2", 
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-foreground">profile/activity page</h1>
      </div>

      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <div className="w-32 h-32 bg-muted border-2 border-border rounded-full flex items-center justify-center">
          <User className="w-16 h-16 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground">{profileData.username}</h2>
          <p className="text-muted-foreground">joined on {profileData.joinDate}</p>
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
            {profileData.activities.map((activity, index) => (
              <div key={index} className="flex space-x-4">
                <div className="w-16 h-16 bg-muted border border-border rounded-lg flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground mb-1 capitalize">{activity.type}</div>
                  <ReviewCard
                    username={profileData.username}
                    rating={activity.rating}
                    review={activity.subtitle}
                  />
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <div className="space-y-6">
            {profileData.list.map((item, index) => (
              <div key={index} className="flex space-x-4">
                <div className="w-16 h-16 bg-muted border border-border rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-1">
                  <div className="text-sm text-muted-foreground capitalize">{item.type}</div>
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="listened" className="space-y-6">
          <div className="space-y-6">
            {profileData.listened.map((item, index) => (
              <div key={index} className="flex space-x-4">
                <div className="w-16 h-16 bg-muted border border-border rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-1">
                  <div className="text-sm text-muted-foreground capitalize">{item.type}</div>
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;