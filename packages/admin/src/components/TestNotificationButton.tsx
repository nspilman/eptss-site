"use client";

import { useState } from "react";
import { sendTestNotification } from "../actions/sendTestNotification";
import { motion } from "framer-motion";
import { Button } from "@eptss/ui";

export function TestNotificationButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSendTestNotification = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await sendTestNotification();

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Test notification sent!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send test notification' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsLoading(false);

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleSendTestNotification}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? '🔔 Sending...' : '🔔 Send Test Notification'}
      </Button>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-900/30 border border-green-700 text-green-300'
              : 'bg-red-900/30 border border-red-700 text-red-300'
          }`}
        >
          {message.text}
        </motion.div>
      )}
    </div>
  );
}
