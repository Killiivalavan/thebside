import { Search, User, LogOut } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useAuth } from "@/contexts/AuthProvider";
import { useUserProfile } from "@/hooks/useUserProfile";

export const Layout = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
              <span className="text-foreground font-semibold">the B-side</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="search" 
                  className="pl-10 bg-muted border-border rounded-full"
                />
              </div>
            </div>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link to={`/profile/${profile?.username || "me"}`}>
                  <Button variant="ghost" size="sm" className="rounded-full flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.username || "User"} />
                      <AvatarFallback className="text-xs">
                        {profile?.username ? profile.username.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    {profileLoading ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      profile?.username || user.email?.split('@')[0] || "User"
                    )}
                  </Button>
                </Link>
                <Button variant="outline" size="icon" onClick={signOut} aria-label="Sign out">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/">
                <Button variant="ghost" size="sm" className="rounded-full">
                  <User className="w-4 h-4 mr-2" />
                  sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};