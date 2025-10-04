"use client";

import { useState } from "react";
import { sendTestSignupEmail, sendTestVotingEmail, sendTestSubmissionEmail } from "./actions/sendTestEmail";
import { motion } from "framer-motion";

const Button = ({ 
  children, 
  onClick, 
  disabled, 
  className 
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <button 
    onClick={onClick}
    disabled={disabled} 
    className={`px-4 py-2 rounded-md font-medium transition-all ${
      disabled 
        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
        : 'bg-gradient-to-r from-[#40e2e2] to-[#e2e240] text-[#0a0a14] hover:opacity-90'
    } ${className || ''}`}
  >
    {children}
  </button>
);

export function TestEmailButtons() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSendTestEmail = async (type: 'signup' | 'voting' | 'submission') => {
    setIsLoading(type);
    setMessage(null);

    try {
      let result;
      
      switch (type) {
        case 'signup':
          result = await sendTestSignupEmail();
          break;
        case 'voting':
          result = await sendTestVotingEmail();
          break;
        case 'submission':
          result = await sendTestSubmissionEmail();
          break;
      }
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Test email sent!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send test email' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      setIsLoading(null);
      
      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button 
          onClick={() => handleSendTestEmail('signup')}
          disabled={isLoading !== null}
          className="w-full"
        >
          {isLoading === 'signup' ? '📧 Sending...' : '📧 Signup Email'}
        </Button>
        
        <Button 
          onClick={() => handleSendTestEmail('voting')}
          disabled={isLoading !== null}
          className="w-full"
        >
          {isLoading === 'voting' ? '🗳️ Sending...' : '🗳️ Voting Email'}
        </Button>
        
        <Button 
          onClick={() => handleSendTestEmail('submission')}
          disabled={isLoading !== null}
          className="w-full"
        >
          {isLoading === 'submission' ? '🎸 Sending...' : '🎸 Submission Email'}
        </Button>
      </div>
      
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
