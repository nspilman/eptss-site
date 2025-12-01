"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@eptss/ui";
import { Mail, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function TestAdminNotificationEmailButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  const [details, setDetails] = useState<any>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setMessage(null);
    setDetails(null);

    try {
      const response = await fetch('/api/admin/test-notification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          setMessage({
            type: 'success',
            text: data.message
          });
          setDetails(data);
        } else {
          setMessage({
            type: 'info',
            text: data.message || 'No notification emails to send'
          });
          setDetails(data);
        }
      } else {
        setMessage({
          type: 'error',
          text: data.error || data.message || 'Failed to send test email'
        });
        if (data.error) {
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
            <Mail className="mr-2" />
            Test My Notification Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary mb-4">
            Send a test notification email to your admin account. This will use your actual unread notifications.
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
              <div className="space-y-1 text-secondary">
                {details.recipientEmail && (
                  <div><strong>Sent to:</strong> {details.recipientEmail}</div>
                )}
                {details.unreadCount !== undefined && (
                  <div><strong>Unread notifications:</strong> {details.unreadCount}</div>
                )}
                {details.emailType && (
                  <div><strong>Email type:</strong> {details.emailType}</div>
                )}
                {details.error && (
                  <div className="mt-2">
                    <strong>Error details:</strong>
                    <pre className="mt-1">{JSON.stringify(details, null, 2)}</pre>
                  </div>
                )}
              </div>
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
                Sending...
              </>
            ) : (
              'Send Test Email to Me'
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
