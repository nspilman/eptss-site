"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Label } from "@eptss/ui";
import { Music } from "lucide-react";
import { motion } from "framer-motion";
import { getSignupSongsForRound, setRoundSong } from "@eptss/data-access";

type Song = {
  id: number;
  title: string;
  artist: string;
};

type SetRoundSongFormProps = {
  roundId: number;
  roundSlug: string;
};

export function SetRoundSongForm({ roundId, roundSlug }: SetRoundSongFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSongId, setSelectedSongId] = useState<number | "">("");

  // Load songs from signups when component mounts
  useEffect(() => {
    const loadSongs = async () => {
      if (!roundId) return;
      
      setIsLoading(true);
      setMessage(null);
      
      try {
        const result = await getSignupSongsForRound(roundId);
        if (result.status === "success" && result.data.length > 0) {
          setSongs(result.data);
        } else {
          setMessage({ 
            type: 'error', 
            text: result.message || "No songs found for this round. Make sure there are signups first." 
          });
        }
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: error instanceof Error ? error.message : "Failed to load songs" 
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSongs();
  }, [roundId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSongId) {
      setMessage({ type: 'error', text: "Please select a song" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await setRoundSong(roundId, Number(selectedSongId));

      if (result.status === "success") {
        const selectedSong = songs.find(song => song.id === Number(selectedSongId));
        setMessage({ 
          type: 'success', 
          text: `Song "${selectedSong?.title} - ${selectedSong?.artist}" set for round "${roundSlug}"!` 
        });
        setSelectedSongId("");
      } else {
        setMessage({ type: 'error', text: result.message || "Failed to set song for round" });
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
            <Music className="mr-2" />
            Set Round Song
          </CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded-md ${message.type === 'success' ? 'bg-accent-primary/20 text-accent-primary' : 'bg-red-500/20 text-red-500'}`}>
              {message.text}
            </div>
          )}
          
          {isLoading ? (
            <div className="text-center py-4 text-secondary">Loading songs...</div>
          ) : songs.length === 0 ? (
            <div className="text-center py-4 text-secondary">
              No songs found for this round. Make sure there are signups first.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="songId" className="text-primary">Select Song from Signups</Label>
                <select
                  id="songId"
                  value={selectedSongId}
                  onChange={(e) => setSelectedSongId(Number(e.target.value))}
                  required
                  className="w-full p-2 rounded-md bg-background-secondary/50 border border-background-tertiary/50 text-primary"
                >
                  <option value="">-- Select a song --</option>
                  {songs.map((song) => (
                    <option key={song.id} value={song.id}>
                      {song.title} - {song.artist}
                    </option>
                  ))}
                </select>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedSongId}
                className="w-full"
              >
                {isSubmitting ? "Setting Song..." : "Set as Round Song"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
