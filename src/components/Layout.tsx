import { Search, User } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export const Layout = () => {
  const location = useLocation();
  
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
            <Button variant="ghost" size="sm" className="rounded-full">
              <User className="w-4 h-4 mr-2" />
              username
            </Button>
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