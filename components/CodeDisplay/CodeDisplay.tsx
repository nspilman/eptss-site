'use client';

import { useState } from 'react';

interface CodeDisplayProps {
  code: string;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 max-w-md w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-600">Spotify Code</span>
        <button
          onClick={copyToClipboard}
          className="text-sm bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded transition duration-300 ease-in-out"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="bg-gray-100 rounded p-3 overflow-x-auto">
        <code className="text-sm font-mono break-all text-gray-700">{code}</code>
      </div>
    </div>
  );
};