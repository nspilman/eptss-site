"use client";

import { useState } from "react";
import { adminSignupUser } from "@/data-access/signupService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
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
    className={`w-full p-2 rounded-md bg-gray-900/50 border border-gray-700/50 ${className || ''}`}
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
    className={`w-full p-2 rounded-md bg-gray-900/50 border border-gray-700/50 min-h-[100px] ${className || ''}`}
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
      formData.append("songTitle", songTitle);
      formData.append("artist", artist);
      formData.append("youtubeLink", youtubeLink);
      formData.append("additionalComments", additionalComments);

      const result = await adminSignupUser(formData);

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
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
      <Card className="bg-gray-800/50 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/70 transition-colors">
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
                className="bg-gray-900/50 border-gray-700/50 text-primary mb-2"
              />
              
              <Label htmlFor="userId" className="text-primary">Select User</Label>
              <select
                id="userId"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                required
                className="w-full p-2 rounded-md bg-gray-900/50 border border-gray-700/50 text-primary"
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

            <div className="space-y-2">
              <Label htmlFor="songTitle" className="text-primary">Song Title</Label>
              <Input
                id="songTitle"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                required
                placeholder="Enter song title"
                className="bg-gray-900/50 border-gray-700/50 text-primary"
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
                className="bg-gray-900/50 border-gray-700/50 text-primary"
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
                className="bg-gray-900/50 border-gray-700/50 text-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalComments" className="text-primary">Additional Comments</Label>
              <Textarea
                id="additionalComments"
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                placeholder="Any additional comments (optional)"
                className="bg-gray-900/50 border-gray-700/50 text-primary"
              />
            </div>

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
