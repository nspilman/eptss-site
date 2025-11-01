"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@eptss/ui";
import { Calendar, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function TestCreateFutureRoundsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [details, setDetails] = useState<any>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setMessage(null);
    setDetails(null);

    try {
      const response = await fetch('/api/cron/create-future-rounds', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.action === 'created') {
          setMessage({ 
            type: 'success', 
            text: `Created ${data.createdRounds.length} future round(s): ${data.createdRounds.map((r: any) => r.slug).join(', ')}` 
          });
          setDetails(data);
        } else {
          setMessage({ 
            type: 'info', 
            text: data.message || 'No action taken (expected if 2 future rounds already exist)' 
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
            <Calendar className="mr-2" />
            Test Create Future Rounds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary mb-4">
            Test the cron job that automatically creates 2 future quarterly rounds.
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
            <div className="mb-4 p-3 rounded-md bg-background-tertiary/30 text-xs max-h-64 overflow-auto">
              <pre className="text-secondary">
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
              'Test Create Future Rounds'
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
