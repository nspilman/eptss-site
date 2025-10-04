import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';

interface BaseEmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

/**
 * Base email layout component that provides consistent styling
 * and structure for all EPTSS emails
 * Uses EPTSS brand colors: dark background with cyan/yellow accents
 */
export const BaseEmailLayout = ({
  children,
  preview,
}: BaseEmailLayoutProps) => {
  return (
    <Html>
      <Head />
      {preview && <Text className="hidden">{preview}</Text>}
      <Tailwind>
        <Body className="bg-[#0a0a14] font-sans">
          <Container className="mx-auto my-8 max-w-2xl">
            {children}
            
            {/* Footer */}
            <Text className="mt-5 text-center text-xs text-gray-500">
              EPTSS - Everyone Plays the Same Song
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BaseEmailLayout;
