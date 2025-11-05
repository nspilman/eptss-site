"use client";

import { useState } from "react";
import { adminSubmitCover } from "@eptss/actions";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label, Textarea, useToast } from "@eptss/ui";
import { Music } from "lucide-react";
import { motion } from "framer-motion";

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
  const { toast } = useToast();
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
        toast({
          title: "Success",
          description: result.message,
        });
        // Reset form
        setSelectedUserId("");
        setSoundcloudUrl("");
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
