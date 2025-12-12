import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";

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

  // Generate stable random offsets for the carousel items
  const carouselOffsets = useMemo(() => {
    return Array.from({ length: 3 }, (_, row) =>
      Array.from({ length: 12 }, () => Math.random() * 20 - 10)
    );
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-background overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Header Branding */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="the B-side logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-foreground font-semibold text-lg">the B-side</span>
        </div>

        {/* Background Album Art Carousels */}
        <div className="absolute inset-0 flex flex-col justify-center gap-8 opacity-20 select-none pointer-events-none overflow-hidden -rotate-12 scale-125">
          {[...Array(3)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex gap-4 min-w-full ${rowIndex % 2 === 0 ? 'animate-scroll' : 'animate-scroll-reverse'}`}
              style={{ width: 'fit-content' }}
            >
              {/* Double the items for seamless loop */}
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="flex gap-4">
                  {Array.from({ length: 12 }, (_, i) => {
                    // Calculate unique index: (Row * 12) + CurrentIndex + 1
                    // Row 0: 1-12, Row 1: 13-24, Row 2: 25-36
                    const imageIndex = (rowIndex * 12) + i + 1;
                    const num = String(imageIndex).padStart(2, '0');

                    // Use the pre-calculated offset based on the image index (0-11)
                    // We use 'i' directly so that both sets (setIndex 0 and 1) use the SAME offset
                    // This prevents the "snap" when the carousel loops
                    const offsetIndex = i;

                    return (
                      <div
                        key={i}
                        className="w-40 h-40 rounded-lg flex-shrink-0 border border-white/5 transition-transform duration-1000 overflow-hidden bg-muted"
                        style={{
                          transform: `translateY(${carouselOffsets[rowIndex][offsetIndex]}px)`,
                        }}
                      >
                        <img
                          src={`/albums/L${num}.webp`}
                          alt=""
                          className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-4xl border-2 border-border rounded-3xl p-12 md:p-16 bg-background/80 backdrop-blur-sm mx-4">
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
                Where Hot Takes are the Hottest Tracks
              </h1>

              <Button
                variant="outline"
                className="px-6 py-3 border-2 border-border hover:bg-accent rounded-lg text-base inline-flex items-center gap-2"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
              >
                {/* Google logo */}
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.158 7.961 3.039l5.657-5.657C33.643 6.053 29.084 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.68 16.108 18.961 12 24 12c3.059 0 5.842 1.158 7.961 3.039l5.657-5.657C33.643 6.053 29.084 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.861-1.977 13.409-5.197l-6.2-5.238C29.135 35.091 26.715 36 24 36c-5.199 0-9.616-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.79 2.229-2.231 4.153-4.094 5.565l6.2 5.238C36.981 39.687 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
                </svg>
                <span>{isSigningIn ? 'Signing in...' : 'Start Exploring'}</span>
              </Button>
              <p className="text-muted-foreground italic">
                Every Song Deserves a Voice. Give it Yours.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-muted-foreground">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 bg-background py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Get Real About Music</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join a community of music lovers who listen, rate, and debate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="group flex flex-col items-center text-center space-y-4 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:scale-105 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Rate & Review</h3>
              <p className="text-muted-foreground">
                Log every album you listen to. Give it a star rating and share your hot takes with the world.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group flex flex-col items-center text-center space-y-4 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:scale-105 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Curate Lists</h3>
              <p className="text-muted-foreground">
                Create ranked lists of your favorite albums, from "That 2016 times" to "Music for the soul".
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group flex flex-col items-center text-center space-y-4 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 hover:scale-105 hover:shadow-2xl transition-all duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Follow & Connect</h3>
              <p className="text-muted-foreground">
                Follow your friends and favorite curators. Keep track of their latest reviews, lists, and rankings in your personalized activity feed.
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Spotify Integration Section */}
      <div className="hidden relative z-10 bg-muted/30 py-24 px-6 md:px-12 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Powered by Your <span className="text-[#1DB954]">Spotify</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Don't start from scratch. Connect your Spotify account to instantly bring your music identity to The B-side.
            </p>
            <ul className="space-y-4">
              {[
                "Export your lists to spotify in seconds",
                "Sync your listening history automatically",
                "Get recommendations based on your actual listening habits",
                "Rate and review your favourite playlists"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg">
                  <div className="w-6 h-6 rounded-full bg-[#1DB954]/20 flex items-center justify-center text-[#1DB954]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual Placeholder */}
          <div className="flex-1 flex justify-center">
            <div className="w-full max-w-md aspect-square bg-card border border-border rounded-3xl p-8 flex items-center justify-center relative overflow-hidden shadow-2xl">
              {/* Abstract visual representing sync */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/10 to-transparent" />
              <div className="text-center space-y-6 relative z-10">
                <div className="w-24 h-24 mx-auto bg-[#1DB954] rounded-full flex items-center justify-center text-black shadow-lg shadow-[#1DB954]/20">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.779-.6 13.5 1.621.42.3.54.84.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.279c-.6.181-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.2-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">Sync Active</div>
                  <p className="text-muted-foreground">Your library is always up to date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Footer / Contact */}
      <div className="relative z-10 py-8 text-center text-muted-foreground text-sm bg-background border-t border-border/50">
        <p>
          Spot a glitch in the mix? Or have an idea to amplify the experience?{" "}
          <span className="block sm:inline">
            Reach out to{" "}
            <a href="mailto:dev.killie@gmail.com" className="text-primary hover:underline transition-colors font-medium">
              dev.killie@gmail.com
            </a>
          </span>
        </p>
      </div>
    </div>
  );
};

export default Index;
