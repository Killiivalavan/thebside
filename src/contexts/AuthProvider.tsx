import React from "react";
import { supabase } from "@/lib/supabaseClient";
import { generateUsernameFromEmail, ensureUniqueUsername } from "@/lib/utils";

type AuthContextValue = {
  user: import("@supabase/supabase-js").User | null;
  session: import("@supabase/supabase-js").Session | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isCreatingProfile: boolean;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = React.useState<import("@supabase/supabase-js").Session | null>(null);
  const [user, setUser] = React.useState<import("@supabase/supabase-js").User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreatingProfile, setIsCreatingProfile] = React.useState(false);

  /**
   * Creates a user profile in the users table if it doesn't exist
   */
  const createUserProfile = React.useCallback(async (user: import("@supabase/supabase-js").User) => {
    if (!user.email) {
      console.error('Cannot create profile: user email is missing');
      return;
    }

    try {
      setIsCreatingProfile(true);

      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking existing profile:', checkError);
        return;
      }

      if (existingProfile) {
        // Profile already exists, nothing to do
        return;
      }

      // Generate username from email
      const baseUsername = generateUsernameFromEmail(user.email);

      // Check for existing usernames and ensure uniqueness
      const { data: existingUsernames, error: usernamesError } = await supabase
        .from('users')
        .select('username');

      if (usernamesError) {
        console.error('Error fetching existing usernames:', usernamesError);
        return;
      }

      const uniqueUsername = ensureUniqueUsername(
        baseUsername,
        existingUsernames?.map(u => u.username) || []
      );

      // Create the profile
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          username: uniqueUsername,
          bio: null,
          avatar_url: user.user_metadata?.avatar_url || null,
        });

      if (createError) {
        console.error('Error creating user profile:', createError);
        return;
      }

      console.log('User profile created successfully');
    } catch (error) {
      console.error('Unexpected error creating user profile:', error);
    } finally {
      setIsCreatingProfile(false);
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      
      // Create profile ONLY on initial sign in, not on session refresh
      if (event === 'SIGNED_IN' && nextSession?.user) {
        await createUserProfile(nextSession.user);
      }
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = React.useCallback(async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
  }, []);

  const signOut = React.useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = React.useMemo<AuthContextValue>(
    () => ({ user, session, signInWithGoogle, signOut, isLoading, isCreatingProfile }),
    [user, session, signInWithGoogle, signOut, isLoading, isCreatingProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


