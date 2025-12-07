"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, FormLabel } from "@eptss/ui";
import { Calendar, Music } from "lucide-react";
import { motion } from "framer-motion";
import { createRound } from "@eptss/data-access";

type CreateRoundFormProps = {
  projectId: string; // Required - must be passed from parent
};

export function CreateRoundForm({ projectId }: CreateRoundFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Form state
  const [slug, setSlug] = useState("");
  const [signupOpens, setSignupOpens] = useState("");
  const [votingOpens, setVotingOpens] = useState("");
  const [coveringBegins, setCoveringBegins] = useState("");
  const [coversDue, setCoversDue] = useState("");
  const [listeningParty, setListeningParty] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await createRound({
        projectId,
        slug,
        signupOpens: new Date(signupOpens),
        votingOpens: new Date(votingOpens),
        coveringBegins: new Date(coveringBegins),
        coversDue: new Date(coversDue),
        listeningParty: new Date(listeningParty),
        playlistUrl
      });

      if (result.status === "success") {
        setMessage({ type: 'success', text: `Round "${slug}" created successfully!` });
        // Reset form
        setSlug("");
        setSignupOpens("");
        setVotingOpens("");
        setCoveringBegins("");
        setCoversDue("");
        setListeningParty("");
        setPlaylistUrl("");
      } else {
        setMessage({ type: 'error', text: result.message || "Failed to create round" });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : "An unexpected error occurred" 
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
            <Calendar className="mr-2" />
            Create New Round
          </CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-accent-primary/20 text-accent-primary' : 'bg-red-500/20 text-red-500'}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <FormLabel htmlFor="slug" className="text-primary">Round Slug</FormLabel>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="e.g., round-42"
                className="text-primary"
              />
              <p className="text-xs text-secondary">Unique identifier for the round. Use lowercase with hyphens.</p>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel htmlFor="signupOpens" className="text-primary">Signup Opens</FormLabel>
                <Input
                  id="signupOpens"
                  type="datetime-local"
                  value={signupOpens}
                  onChange={(e) => setSignupOpens(e.target.value)}
                  required
                  className="text-primary"
                />
              </div>

              <div className="space-y-2">
                <FormLabel htmlFor="votingOpens" className="text-primary">Voting Opens</FormLabel>
                <Input
                  id="votingOpens"
                  type="datetime-local"
                  value={votingOpens}
                  onChange={(e) => setVotingOpens(e.target.value)}
                  required
                  className="text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel htmlFor="coveringBegins" className="text-primary">Covering Begins</FormLabel>
                <Input
                  id="coveringBegins"
                  type="datetime-local"
                  value={coveringBegins}
                  onChange={(e) => setCoveringBegins(e.target.value)}
                  required
                  className="text-primary"
                />
              </div>

              <div className="space-y-2">
                <FormLabel htmlFor="coversDue" className="text-primary">Covers Due</FormLabel>
                <Input
                  id="coversDue"
                  type="datetime-local"
                  value={coversDue}
                  onChange={(e) => setCoversDue(e.target.value)}
                  required
                  className="text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel htmlFor="listeningParty" className="text-primary">Listening Party</FormLabel>
                <Input
                  id="listeningParty"
                  type="datetime-local"
                  value={listeningParty}
                  onChange={(e) => setListeningParty(e.target.value)}
                  required
                  className="text-primary"
                />
              </div>

              <div className="space-y-2">
                <FormLabel htmlFor="playlistUrl" className="text-primary">Playlist URL</FormLabel>
                <Input
                  id="playlistUrl"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="Optional SoundCloud playlist URL"
                  className="text-primary"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Creating Round..." : "Create Round"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
