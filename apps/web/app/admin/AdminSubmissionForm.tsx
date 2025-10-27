"use client";

import { useState } from "react";
import { adminSubmitCover } from "@eptss/data-access";
import { Card, CardContent, CardHeader, CardTitle } from "@eptss/ui";
import { Music } from "lucide-react";
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

type User = {
  userid: string;
  email: string;
  username: string;
};

type AdminSubmissionFormProps = {
  roundId: number;
  users: User[];
};

export const AdminSubmissionForm = ({ roundId, users }: AdminSubmissionFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [soundcloudUrl, setSoundcloudUrl] = useState("");
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
      formData.append("soundcloudUrl", soundcloudUrl);
      formData.append("additionalComments", additionalComments);

      const result = await adminSubmitCover(formData);

      if (result.status === "Success") {
        alert(`Success: ${result.message}`);
        // Reset form
        setSelectedUserId("");
        setSoundcloudUrl("");
        setAdditionalComments("");
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      alert("An unexpected error occurred");
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
            <Music className="mr-2" />
            Add Submission for User
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

            <div className="space-y-2">
              <Label htmlFor="soundcloudUrl" className="text-primary">SoundCloud URL</Label>
              <Input
                id="soundcloudUrl"
                value={soundcloudUrl}
                onChange={(e) => setSoundcloudUrl(e.target.value)}
                required
                placeholder="Enter SoundCloud URL"
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

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Add Submission"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
