import React from 'react';
import { TypographyExample } from './TypographyExample';
import { ThemeSection } from './ThemeSection';

import { Text } from "@eptss/ui";
export const TypographySection = () => (
  <ThemeSection 
    title="Typography" 
    description="Typography variables are defined using --text-*, --font-*, and --font-weight-* variables."
  >
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4 ">Font Families</h3>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-md border border-border">
            <div className="font-sans mb-3">
              <Text as="span" size="sm" color="muted" className="block mb-1">Sans:</Text> 
              <span className="">The quick brown fox jumps over the lazy dog</span>
              <Text as="span" size="xs" color="primary" className="block mt-1">--font-sans</Text>
            </div>
            <div className="font-serif mb-3">
              <Text as="span" size="sm" color="muted" className="block mb-1">Serif:</Text> 
              <span className="">The quick brown fox jumps over the lazy dog</span>
              <Text as="span" size="xs" color="primary" className="block mt-1">--font-serif</Text>
            </div>
            <div className="font-mono mb-3">
              <Text as="span" size="sm" color="muted" className="block mb-1">Mono:</Text> 
              <span className="">The quick brown fox jumps over the lazy dog</span>
              <Text as="span" size="xs" color="primary" className="block mt-1">--font-mono</Text>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif' }} className="mb-3">
              <Text as="span" size="sm" color="muted" className="block mb-1">Fraunces:</Text> 
              <span className="">The quick brown fox jumps over the lazy dog</span>
              <Text as="span" size="xs" color="primary" className="block mt-1">--font-fraunces</Text>
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif' }}>
              <Text as="span" size="sm" color="muted" className="block mb-1">Roboto:</Text> 
              <span className="">The quick brown fox jumps over the lazy dog</span>
              <Text as="span" size="xs" color="primary" className="block mt-1">--font-roboto</Text>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4 ">Font Sizes</h3>
        <div className="space-y-4">
          <TypographyExample name="text-sm" className="text-sm" cssVariable="--text-sm" description="14px, 1.25rem" />
          <TypographyExample name="text-base" className="text-base" cssVariable="--text-base" description="16px, 1.25rem" />
          <TypographyExample name="text-lg" className="text-lg" cssVariable="--text-lg" description="20px, 1.25rem" />
          <TypographyExample name="text-xl" className="text-xl" cssVariable="--text-xl" description="24px, 1.25rem" />
          <TypographyExample name="text-3xl" className="text-3xl" cssVariable="--text-3xl" description="1.875rem, 1.75rem" />
          <TypographyExample name="text-header" className="text-[36px]" cssVariable="--text-header" description="36px, 1.25rem" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4 ">Font Weights</h3>
        <div className="space-y-4">
          <TypographyExample name="font-light" className="font-light text-lg" cssVariable="--font-weight-light" />
          <TypographyExample name="font-normal" className="font-normal text-lg" cssVariable="--font-weight-normal" />
          <TypographyExample name="font-medium" className="font-medium text-lg" cssVariable="--font-weight-medium" />
          <TypographyExample name="font-semibold" className="font-semibold text-lg" cssVariable="--font-weight-semibold" />
          <TypographyExample name="font-bold" className="font-bold text-lg" cssVariable="--font-weight-bold" />
        </div>
      </div>
    </div>
  </ThemeSection>
);
