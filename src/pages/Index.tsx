import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthProvider";

const Index = () => {
  const { signInWithGoogle } = useAuth();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md mx-auto p-8">
        <div className="text-center space-y-8">
          {/* Logo/Branding */}
          <div className="space-y-4">
            <div className="w-24 h-24 bg-muted border-2 border-border rounded-2xl mx-auto flex items-center justify-center">
              <div className="w-16 h-16 bg-primary rounded-xl"></div>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Welcome to<br />the B-side
            </h1>
          </div>

          {/* Login Button */}
          <Button 
            variant="outline" 
            className="w-full py-3 border-2 border-border hover:bg-accent"
            onClick={signInWithGoogle}
          >
            continue with google
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
