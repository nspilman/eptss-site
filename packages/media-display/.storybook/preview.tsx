import type { Preview } from "@storybook/react";
import React from "react";
import "./preview.css";
import { Buffer } from 'buffer';

// TypeScript declaration for Buffer on window
declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
  // eslint-disable-next-line no-var
  var process: {
    env: Record<string, string | undefined>;
    on: (event: string, listener: (...args: any[]) => void) => void;
  };
}

// Polyfill Buffer for browser environment
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

// Polyfill process for browser environment
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: { NODE_ENV: 'development' },
    on: () => {}, // No-op for browser - process events don't make sense here
  } as any;
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      expanded: true,
    },
    docs: {
      theme: 'dark',
      source: {
        type: 'dynamic',
      },
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#0a0a14',
        },
        {
          name: 'light',
          value: '#ffffff',
        },
      ],
    },
  },
};

export const decorators = [
  (Story) => {
    return (
      <div
        className="min-h-screen p-4"
        style={{
          backgroundColor: 'var(--color-background-primary)',
          color: 'var(--color-primary)'
        }}
      >
        <Story />
      </div>
    );
  },
];

export default preview;
