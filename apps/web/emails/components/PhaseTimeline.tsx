import * as React from 'react';
import { Section, Text } from '@react-email/components';

interface PhaseTimelineItemProps {
  title: string;
  date: string;
  description: string;
  color?: 'yellow' | 'cyan';
}

/**
 * Individual timeline item for round phases
 * Uses EPTSS brand colors: yellow (#e2e240) and cyan (#40e2e2)
 */
export const PhaseTimelineItem = ({
  title,
  date,
  description,
  color = 'yellow',
}: PhaseTimelineItemProps) => {
  const borderColor = color === 'yellow' ? 'border-[#e2e240]' : 'border-[#40e2e2]';
  const textColor = color === 'yellow' ? 'text-[#e2e240]' : 'text-[#40e2e2]';
  
  return (
    <Section className={`mb-4 border-l-4 ${borderColor} pl-4`}>
      <Text className={`mb-1 font-semibold ${textColor}`}>
        {title}: {date}
      </Text>
      <Text className="mt-0 text-sm text-gray-400">{description}</Text>
    </Section>
  );
};

interface PhaseTimelineProps {
  phases: Array<{
    title: string;
    date: string;
    description: string;
    color?: 'yellow' | 'cyan';
  }>;
}

/**
 * Timeline component for displaying round phases
 */
export const PhaseTimeline = ({ phases }: PhaseTimelineProps) => {
  return (
    <>
      {phases.map((phase, index) => (
        <PhaseTimelineItem key={index} {...phase} />
      ))}
    </>
  );
};

export default PhaseTimeline;
