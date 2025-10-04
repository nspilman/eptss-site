import * as React from 'react';
import { Heading, Section } from '@react-email/components';

interface EmailHeaderProps {
  title: string;
  emoji?: string;
}

/**
 * Reusable email header component with gradient background
 * Uses EPTSS brand colors: cyan to yellow gradient
 */
export const EmailHeader = ({ title, emoji }: EmailHeaderProps) => {
  return (
    <Section className="rounded-t-lg bg-gradient-to-r from-[#40e2e2] to-[#e2e240] px-8 py-10 text-center">
      <Heading className="m-0 text-3xl font-bold text-[#0a0a14]">
        {emoji && `${emoji} `}
        {title}
      </Heading>
    </Section>
  );
};

export default EmailHeader;
