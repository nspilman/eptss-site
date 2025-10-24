"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@eptss/ui";
import { Calendar, Music } from "lucide-react";
import { motion } from "framer-motion";
import { createRound } from "@eptss/data-access";

// UI Components
const Button = ({ children, type, disabled, className }: { children: React.ReactNode, type?: "submit" | "button", disabled?: boolean, className?: string }) => (
  <button 
    type={type || "button"} 
    disabled={disabled} 
    className={`px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-md transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
  >
    {children}
  </button>
);

const Input = ({ id, value, onChange, required, placeholder, className, type = "text" }: { id: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean, placeholder?: string, className?: string, type?: string }) => (
  <input
    id={id}
    value={value}
    onChange={onChange}
    required={required}
    placeholder={placeholder}
    type={type}
    className={`w-full p-2 rounded-md bg-background-secondary/50 border border-background-tertiary/50 ${className || ''}`}
  />
);

const Label = ({ htmlFor, children, className }: { htmlFor: string, children: React.ReactNode, className?: string }) => (
  <label htmlFor={htmlFor} className={`block mb-1 ${className || ''}`}>{children}</label>
);

export function CreateRoundForm() {
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
              <Label htmlFor="slug" className="text-primary">Round Slug</Label>
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
                <Label htmlFor="signupOpens" className="text-primary">Signup Opens</Label>
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
                <Label htmlFor="votingOpens" className="text-primary">Voting Opens</Label>
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
                <Label htmlFor="coveringBegins" className="text-primary">Covering Begins</Label>
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
                <Label htmlFor="coversDue" className="text-primary">Covers Due</Label>
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
                <Label htmlFor="listeningParty" className="text-primary">Listening Party</Label>
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
                <Label htmlFor="playlistUrl" className="text-primary">Playlist URL</Label>
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
