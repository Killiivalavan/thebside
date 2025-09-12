import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthProvider";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, isCreatingProfile, isLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setIsProcessing(true);
        
        // Wait for auth to be initialized
        if (isLoading) {
          return;
        }

        // If no user after auth is loaded, there was an error
        if (!user) {
          setError("Authentication failed. Please try again.");
          setTimeout(() => navigate("/", { replace: true }), 3000);
          return;
        }

        // Wait for profile creation to complete
        if (isCreatingProfile) {
          return;
        }

        // Profile creation is complete, redirect to discover
        navigate("/discover", { replace: true });
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Something went wrong. Redirecting...");
        setTimeout(() => navigate("/", { replace: true }), 3000);
      } finally {
        setIsProcessing(false);
      }
    };
    
    run();
  }, [navigate, user, isCreatingProfile, isLoading]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isLoading ? "Signing you in..." : 
           isCreatingProfile ? "Setting up your profile..." : 
           "Redirecting..."}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;


