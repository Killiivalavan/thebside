import { useState } from "react";
import { Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "@/hooks/use-toast";

interface ProfileEditDialogProps {
  currentUsername: string;
  currentBio: string | null;
  onProfileUpdate: () => void;
}

export const ProfileEditDialog = ({ 
  currentUsername, 
  currentBio, 
  onProfileUpdate 
}: ProfileEditDialogProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(currentUsername);
  const [bio, setBio] = useState(currentBio || "");
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const validateUsername = async (newUsername: string) => {
    if (!newUsername || newUsername.trim().length === 0) {
      setUsernameError("Username is required");
      return false;
    }

    if (newUsername.length < 3) {
      setUsernameError("Username must be at least 3 characters");
      return false;
    }

    if (newUsername.length > 30) {
      setUsernameError("Username must be less than 30 characters");
      return false;
    }

    if (!/^[a-z0-9._-]+$/i.test(newUsername)) {
      setUsernameError("Username can only contain letters, numbers, dots, underscores, and hyphens");
      return false;
    }

    // Check if username is already taken (and it's not the current username)
    if (newUsername !== currentUsername) {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', newUsername)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        setUsernameError("Error checking username availability");
        return false;
      }

      if (data) {
        setUsernameError("Username is already taken");
        return false;
      }
    }

    setUsernameError(null);
    return true;
  };

  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    if (value !== currentUsername) {
      // Debounce validation
      setTimeout(() => validateUsername(value), 500);
    } else {
      setUsernameError(null);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const isValid = await validateUsername(username);
    if (!isValid) return;

    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('users')
        .update({
          username: username.trim(),
          bio: bio.trim() || null,
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });

      onProfileUpdate();
      setOpen(false);
    } catch (err) {
      console.error('Unexpected error updating profile:', err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername(currentUsername);
    setBio(currentBio || "");
    setUsernameError(null);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your username and bio. Changes will be visible to other users.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="Enter your username"
              className={usernameError ? "border-red-500" : ""}
            />
            {usernameError && (
              <p className="text-sm text-red-500">{usernameError}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/500 characters
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !!usernameError}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
