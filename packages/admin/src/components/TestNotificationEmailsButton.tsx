"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@eptss/ui";
import { Bell, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function TestNotificationEmailsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [details, setDetails] = useState<any>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setMessage(null);
    setDetails(null);

    try {
      const response = await fetch('/api/cron/send-notification-emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.emailsSent > 0) {
          setMessage({
            type: 'success',
            text: `Successfully sent ${data.emailsSent} notification email(s)`
          });
          setDetails(data);
        } else {
          setMessage({
            type: 'info',
            text: data.message || 'No notification emails needed to be sent'
          });
          setDetails(data);
        }
      } else {
        setMessage({
          type: 'error',
          text: data.error || data.message || 'Failed to test endpoint'
        });
        if (data.errors && data.errors.length > 0) {
          setDetails(data);
        }
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
            <Bell className="mr-2" />
            Test Notification Emails
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary mb-4">
            Test the cron job that sends notification emails to users with unread notifications.
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
              'Test Notification Emails'
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
