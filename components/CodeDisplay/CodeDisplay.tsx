'use client';

import { Code } from '@/components/ui/primitives';

interface CodeDisplayProps {
  code: string;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ code }) => {
  return (
    <Code 
      code={code}
      title="Spotify Code"
      className="max-w-md w-full"
    />
  );
};