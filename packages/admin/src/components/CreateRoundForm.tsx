"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, FormLabel, useToast } from "@eptss/ui";
import { Calendar, Music } from "lucide-react";
import { motion } from "framer-motion";
import { createRound } from "@eptss/rounds/services";

type CreateRoundFormProps = {
  projectId: string; // Required - must be passed from parent
  projectSlug?: string; // Optional - for dynamic labels
};

// Helper to get project-specific labels
function getProjectLabels(projectSlug?: string) {
  const isCoverProject = projectSlug === 'cover';

  return {
    workPhaseBegins: isCoverProject ? "Covering Begins" : "Work Begins",
    workPhaseHelper: isCoverProject ? "For cover projects only" : "For creation phase",
    submissionsDue: isCoverProject ? "Covers Due" : "Submissions Due",
  };
}

export function CreateRoundForm({ projectId, projectSlug }: CreateRoundFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Get project-specific labels
  const labels = getProjectLabels(projectSlug);

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

    try {
      const result = await createRound({
        projectId,
        slug,
        signupOpens: signupOpens ? new Date(signupOpens) : undefined,
        votingOpens: votingOpens ? new Date(votingOpens) : undefined,
        coveringBegins: coveringBegins ? new Date(coveringBegins) : undefined,
        coversDue: coversDue ? new Date(coversDue) : undefined,
        listeningParty: listeningParty ? new Date(listeningParty) : undefined,
        playlistUrl: playlistUrl || undefined
      });

      if (result.status === "success") {
        toast({
          title: "Success",
          description: `Round "${slug}" created successfully!`,
          variant: "default",
        });
        // Reset form
        setSlug("");
        setSignupOpens("");
        setVotingOpens("");
        setCoveringBegins("");
        setCoversDue("");
        setListeningParty("");
        setPlaylistUrl("");
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create round",
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
            <Calendar className="mr-2" />
            Create New Round
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  className="text-primary"
                />
              </div>

              <div className="space-y-2">
                <FormLabel htmlFor="votingOpens" className="text-primary">Voting Opens (Optional)</FormLabel>
                <Input
                  id="votingOpens"
                  type="datetime-local"
                  value={votingOpens}
                  onChange={(e) => setVotingOpens(e.target.value)}
                  className="text-primary"
                />
                <p className="text-xs text-secondary">Leave empty for projects without voting</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel htmlFor="coveringBegins" className="text-primary">{labels.workPhaseBegins} (Optional)</FormLabel>
                <Input
                  id="coveringBegins"
                  type="datetime-local"
                  value={coveringBegins}
                  onChange={(e) => setCoveringBegins(e.target.value)}
                  className="text-primary"
                />
                <p className="text-xs text-secondary">{labels.workPhaseHelper}</p>
              </div>

              <div className="space-y-2">
                <FormLabel htmlFor="coversDue" className="text-primary">{labels.submissionsDue}</FormLabel>
                <Input
                  id="coversDue"
                  type="datetime-local"
                  value={coversDue}
                  onChange={(e) => setCoversDue(e.target.value)}
                  className="text-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FormLabel htmlFor="listeningParty" className="text-primary">Listening Party (Optional)</FormLabel>
                <Input
                  id="listeningParty"
                  type="datetime-local"
                  value={listeningParty}
                  onChange={(e) => setListeningParty(e.target.value)}
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
