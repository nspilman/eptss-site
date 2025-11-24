"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, FormLabel, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@eptss/ui";
import { Edit, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { updateRound, getRoundBySlug } from "@eptss/data-access";

type UpdateRoundFormProps = {
  allRoundSlugs: string[];
};

export function UpdateRoundForm({ allRoundSlugs }: UpdateRoundFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Form state
  const [selectedSlug, setSelectedSlug] = useState("");
  const [signupOpens, setSignupOpens] = useState("");
  const [votingOpens, setVotingOpens] = useState("");
  const [coveringBegins, setCoveringBegins] = useState("");
  const [coversDue, setCoversDue] = useState("");
  const [listeningParty, setListeningParty] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");

  // Format date for datetime-local input
  const formatDateForInput = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Load round data when slug is selected
  useEffect(() => {
    const loadRoundData = async () => {
      if (!selectedSlug) {
        // Reset form
        setSignupOpens("");
        setVotingOpens("");
        setCoveringBegins("");
        setCoversDue("");
        setListeningParty("");
        setPlaylistUrl("");
        return;
      }

      setIsLoading(true);
      setMessage(null);

      try {
        const result = await getRoundBySlug(selectedSlug);
        
        if (result.status === "success") {
          const round = result.data;
          setSignupOpens(formatDateForInput(round.signupOpens));
          setVotingOpens(formatDateForInput(round.votingOpens));
          setCoveringBegins(formatDateForInput(round.coveringBegins));
          setCoversDue(formatDateForInput(round.coversDue));
          setListeningParty(formatDateForInput(round.listeningParty));
          setPlaylistUrl(round.playlistUrl || "");
        } else {
          setMessage({ type: 'error', text: result.message || "Failed to load round data" });
        }
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: error instanceof Error ? error.message : "An unexpected error occurred" 
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRoundData();
  }, [selectedSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await updateRound({
        slug: selectedSlug,
        signupOpens: new Date(signupOpens),
        votingOpens: new Date(votingOpens),
        coveringBegins: new Date(coveringBegins),
        coversDue: new Date(coversDue),
        listeningParty: new Date(listeningParty),
        playlistUrl: playlistUrl || undefined
      });

      if (result.status === "success") {
        setMessage({ type: 'success', text: `Round "${selectedSlug}" updated successfully!` });
      } else {
        setMessage({ type: 'error', text: result.message || "Failed to update round" });
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
            <Edit className="mr-2" />
            Update Round
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
              <FormLabel htmlFor="roundSlug" className="text-primary">Select Round</FormLabel>
              <Select value={selectedSlug} onValueChange={setSelectedSlug}>
                <SelectTrigger className="text-primary">
                  <SelectValue placeholder="-- Select a round --" />
                </SelectTrigger>
                <SelectContent>
                  {allRoundSlugs.map((slug) => (
                    <SelectItem key={slug} value={slug}>
                      {slug}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-accent-primary" size={32} />
              </div>
            )}

            {selectedSlug && !isLoading && (
              <>
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
                  {isSubmitting ? "Updating Round..." : "Update Round"}
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
