"use client";

import { useState } from "react";
import { adminSignupUser } from "@eptss/data-access";
import { Card, CardContent, CardHeader, CardTitle } from "@eptss/ui";
import { UserPlus } from "lucide-react";
import { motion } from "framer-motion";

// Using the existing UI components from the project
const Button = ({ children, type, disabled, className }: { children: React.ReactNode, type?: "submit" | "button", disabled?: boolean, className?: string }) => (
  <button 
    type={type || "button"} 
    disabled={disabled} 
    className={`px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-md transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
  >
    {children}
  </button>
);

const Input = ({ id, value, onChange, required, placeholder, className }: { id: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean, placeholder?: string, className?: string }) => (
  <input
    id={id}
    value={value}
    onChange={onChange}
    required={required}
    placeholder={placeholder}
    className={`w-full p-2 rounded-md bg-background-secondary/50 border border-background-tertiary/50 ${className || ''}`}
  />
);

const Label = ({ htmlFor, children, className }: { htmlFor: string, children: React.ReactNode, className?: string }) => (
  <label htmlFor={htmlFor} className={`block mb-1 ${className || ''}`}>{children}</label>
);

const Textarea = ({ id, value, onChange, placeholder, className }: { id: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder?: string, className?: string }) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full p-2 rounded-md bg-background-secondary/50 border border-background-tertiary/50 min-h-[100px] ${className || ''}`}
  />
);

const useToast = () => {
  return {
    toast: ({ title, description, variant }: { title: string, description: string, variant: string }) => {
      // Simple implementation that uses alert for now
      alert(`${title}: ${description}`);
    }
  };
};

type User = {
  userid: string;
  email: string;
  username: string;
};

type AdminSignupFormProps = {
  roundId: number;
  users: User[];
};

export const AdminSignupForm = ({ roundId, users }: AdminSignupFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [signupWithoutSong, setSignupWithoutSong] = useState(false);
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("userId", selectedUserId);
      formData.append("roundId", roundId.toString());
      
      if (signupWithoutSong) {
        formData.append("songId", "-1");
      } else {
        formData.append("songTitle", songTitle);
        formData.append("artist", artist);
        formData.append("youtubeLink", youtubeLink);
        formData.append("additionalComments", additionalComments);
      }

      console.log("About to call adminSignupUser with:", {
        userId: selectedUserId,
        roundId,
        signupWithoutSong,
        songTitle: signupWithoutSong ? "N/A" : songTitle,
      });

      const result = await adminSignupUser(formData);

      console.log("Result received:", result);
      console.log("Making sure the web app doesn't rebuild")

      if (result.status === "Success") {
        toast({
          title: "Success",
          description: result.message,
          variant: "default",
        });
        // Reset form
        setSelectedUserId("");
        setSongTitle("");
        setArtist("");
        setYoutubeLink("");
        setAdditionalComments("");
        setSignupWithoutSong(false);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-background-secondary/50 backdrop-blur-md border-background-tertiary/50 hover:bg-background-secondary/70 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-primary">
            <UserPlus className="mr-2" />
            Sign Up Existing User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userSearch" className="text-primary">Search Users</Label>
              <Input
                id="userSearch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by email or username"
                className="bg-background-secondary/50 border-background-tertiary/50 text-primary mb-2"
              />
              
              <Label htmlFor="userId" className="text-primary">Select User</Label>
              <select
                id="userId"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full p-2 rounded-md bg-background-secondary/50 border border-background-tertiary/50 text-primary"
                size={searchTerm ? Math.min(8, filteredUsers.length + 1) : 1}
              >
                <option value="">Select a user</option>
                {filteredUsers.map((user) => (
                  <option key={user.userid} value={user.userid}>
                    {user.email} ({user.username})
                  </option>
                ))}
              </select>
              <div className="text-xs text-primary mt-1">
                {searchTerm ? `${filteredUsers.length} users found` : `${users.length} total users`}
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-background-tertiary/30 rounded-md">
              <input
                type="checkbox"
                id="signupWithoutSong"
                checked={signupWithoutSong}
                onChange={(e) => setSignupWithoutSong(e.target.checked)}
                className="w-4 h-4 rounded border-background-tertiary/50"
              />
              <Label htmlFor="signupWithoutSong" className="text-primary cursor-pointer mb-0">
                Sign up without a song
              </Label>
            </div>

            {!signupWithoutSong && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="songTitle" className="text-primary">Song Title</Label>
                  <Input
                    id="songTitle"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    required
                    placeholder="Enter song title"
                    className="bg-background-secondary/50 border-background-tertiary/50 text-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="artist" className="text-primary">Artist</Label>
                  <Input
                    id="artist"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    required
                    placeholder="Enter artist name"
                    className="bg-background-secondary/50 border-background-tertiary/50 text-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtubeLink" className="text-primary">YouTube Link</Label>
                  <Input
                    id="youtubeLink"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    required
                    placeholder="Enter YouTube link"
                    className="bg-background-secondary/50 border-background-tertiary/50 text-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalComments" className="text-primary">Additional Comments</Label>
                  <Textarea
                    id="additionalComments"
                    value={additionalComments}
                    onChange={(e) => setAdditionalComments(e.target.value)}
                    placeholder="Any additional comments (optional)"
                    className="bg-background-secondary/50 border-background-tertiary/50 text-primary"
                  />
                </div>
              </>
            )}

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Signing up..." : "Sign Up User"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
