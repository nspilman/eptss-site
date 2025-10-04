"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { Music, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const Button = ({ children, onClick, disabled, className }: { 
  children: React.ReactNode; 
  onClick: () => void; 
  disabled?: boolean; 
  className?: string;
}) => (
  <button 
    onClick={onClick} 
    disabled={disabled} 
    className={`px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-md transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className || ''}`}
  >
    {children}
  </button>
);

export function TestAssignRoundSongButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [details, setDetails] = useState<any>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setMessage(null);
    setDetails(null);

    try {
      const response = await fetch('/api/cron/assign-round-song', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.action === 'assigned') {
          setMessage({ 
            type: 'success', 
            text: `Song assigned: ${data.assignedSong.title} - ${data.assignedSong.artist}` 
          });
          setDetails(data);
        } else {
          setMessage({ 
            type: 'info', 
            text: data.message || 'No action taken (expected if not in covering phase or song already assigned)' 
          });
          setDetails(data);
        }
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || data.message || 'Failed to test endpoint' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Unexpected error occurred' 
      });
    } finally {
      setIsLoading(false);
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
            Test Auto-Assign Round Song
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary mb-4">
            Test the cron job that automatically assigns the winning song when voting closes.
          </p>

          {message && (
            <div className={`mb-4 p-3 rounded-md ${
              message.type === 'success' ? 'bg-accent-primary/20 text-accent-primary' : 
              message.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
              'bg-red-500/20 text-red-500'
            }`}>
              {message.text}
            </div>
          )}

          {details && (
            <div className="mb-4 p-3 rounded-md bg-background-tertiary/30 text-xs">
              <pre className="overflow-auto text-secondary">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}

          <Button 
            onClick={handleTest} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                Testing...
              </>
            ) : (
              'Test Assign Round Song'
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
