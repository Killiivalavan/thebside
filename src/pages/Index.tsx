import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Index = () => {
  const { signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/discover');
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in:', error);
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl border-2 border-border rounded-3xl p-12 md:p-16">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Left side - Image/Logo */}
          <div className="w-64 h-64 md:w-80 md:h-80 flex-shrink-0 bg-muted rounded-3xl flex items-center justify-center overflow-hidden">
            <img
              src="/login-hero.jpg"
              alt="Welcome artwork"
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>

          {/* Right side - Text and Button */}
          <div className="flex-1 flex flex-col items-center md:items-center justify-center space-y-6 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground leading-tight">
              Welcome to<br />the B-side
            </h1>

            <Button 
              variant="outline" 
              className="px-6 py-3 border-2 border-border hover:bg-accent rounded-lg text-base inline-flex items-center gap-2"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
            >
              {/* Google logo */}
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.158 7.961 3.039l5.657-5.657C33.643 6.053 29.084 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.68 16.108 18.961 12 24 12c3.059 0 5.842 1.158 7.961 3.039l5.657-5.657C33.643 6.053 29.084 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.861-1.977 13.409-5.197l-6.2-5.238C29.135 35.091 26.715 36 24 36c-5.199 0-9.616-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.79 2.229-2.231 4.153-4.094 5.565l6.2 5.238C36.981 39.687 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              <span>{isSigningIn ? 'Signing in...' : 'Start Exploring'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
