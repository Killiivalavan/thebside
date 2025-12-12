import { Search, User, LogOut, Filter } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Avatar as AvatarComponent } from "@/components/Avatar";
import { useState, useRef, useEffect } from "react";
import { useCurrentUserProfile } from "@/hooks/useProfile";
import { useSearchFilters } from "@/context/SearchFilterContext";

export const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const debounceMs = 400;
  const isAutoClearing = useRef(false);
  const { filters, toggleFilter } = useSearchFilters();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e as any);
    }
  };

  // Clear search input when navigating away from /search
  useEffect(() => {
    if (!location.pathname.startsWith('/search') && searchQuery.trim().length > 0) {
      isAutoClearing.current = true;
      setSearchQuery('');
      // Reset the flag after state update completes
      setTimeout(() => {
        isAutoClearing.current = false;
      }, 0);
    }
  }, [location.pathname]);

  // Debounced live search navigation
  useEffect(() => {
    const trimmed = searchQuery.trim();

    // Skip navigation if we're in the middle of auto-clearing
    if (isAutoClearing.current) {
      return;
    }
    
    // If there is no query: only normalize when already on /search
    if (trimmed.length === 0) {
      if (location.pathname.startsWith('/search')) {
        const target = '/search';
        const current = `${location.pathname}${location.search}`;
        if (current !== target) {
          navigate(target, { replace: true });
        }
      }
      return;
    }

    // If user is NOT on /search and starts typing, navigate immediately to /search
    if (!location.pathname.startsWith('/search')) {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      return;
    }

    // User is on /search with non-empty query: debounce URL updates
    const target = `/search?q=${encodeURIComponent(trimmed)}`;
    const timer = setTimeout(() => {
      const current = `${location.pathname}${location.search}`;
      if (current !== target) {
        navigate(target, { replace: true });
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, location.pathname, location.search]);

  // Prefer canonical DB username if available
  const { data: currentProfile } = useCurrentUserProfile();
  const username = currentProfile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'user';
  const avatarUrl = currentProfile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/discover" className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="the B-side logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-foreground font-semibold hidden sm:inline">the B-side</span>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="search albums, artists, tracks..." 
                  className="pl-10 pr-12 h-10 bg-muted border-border rounded-full text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchInput}
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full hover:bg-accent flex items-center justify-center p-0"
                    >
                      <Filter className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Filter Results</h4>
                      <div className="space-y-2">
                        {(Object.keys(filters) as Array<keyof typeof filters>).map((key) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={key}
                              checked={filters[key]}
                              onCheckedChange={() => toggleFilter(key)}
                            />
                            <Label
                              htmlFor={key}
                              className="text-sm font-normal capitalize cursor-pointer"
                            >
                              {key}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </form>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full">
                  {avatarUrl ? (
                    <AvatarComponent src={avatarUrl} alt={username} className="w-6 h-6 mr-0 sm:mr-2" />
                  ) : (
                    <User className="w-4 h-4 mr-0 sm:mr-2" />
                  )}
                  <span className="hidden sm:inline">{username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/profile/${encodeURIComponent(username)}`} className="w-full cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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