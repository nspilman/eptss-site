#!/usr/bin/env node
/**
 * Generate sample media files for Storybook stories
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Generate a simple WAV audio file (1 second of silence with a simple tone)
function generateAudioFile() {
  const sampleRate = 44100;
  const duration = 2; // 2 seconds
  const numSamples = sampleRate * duration;
  const numChannels = 2;
  const bytesPerSample = 2;

  const dataSize = numSamples * numChannels * bytesPerSample;
  const fileSize = 44 + dataSize;

  const buffer = Buffer.alloc(fileSize);

  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize - 8, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // audio format (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // byte rate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // block align
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate simple sine wave
  const frequency = 440; // A4 note
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const value = Math.sin(2 * Math.PI * frequency * t) * 0.3 * 32767;
    const sample = Math.floor(value);

    for (let channel = 0; channel < numChannels; channel++) {
      const offset = 44 + (i * numChannels + channel) * bytesPerSample;
      buffer.writeInt16LE(sample, offset);
    }
  }

  writeFileSync(join(__dirname, 'sample-audio.wav'), buffer);
  console.log('✓ Generated sample-audio.wav');
}

// Generate a simple SVG image
function generateImageFile() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#grad)"/>
  <text x="640" y="360" font-family="Arial" font-size="48" fill="white" text-anchor="middle">Sample Image</text>
</svg>`;

  writeFileSync(join(__dirname, 'sample-image.svg'), svg);
  console.log('✓ Generated sample-image.svg');
}

// Generate a simple video data URL (base64 encoded tiny MP4)
function generateVideoPlaceholder() {
  // This is a minimal 1-frame black MP4 video (1x1 pixel, 1 frame)
  const minimalMp4Base64 = `AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAu1tZGF0AAACrQYF//+p3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlOWE1OTAzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEgc2NlbmVjdXQ9NDAgaW50cmFfcmVmcmVzaD0wIHJjX2xvb2thaGVhZD00MCByYz1jcmYgbWJ0cmVlPTEgY3JmPTIzLjAgcWNvbXA9MC42MCBxcG1pbj0wIHFwbWF4PTY5IHFwc3RlcD00IGlwX3JhdGlvPTEuNDAgYXE9MToxLjAwAIAAAAARZYiEAD//8m+P5OXfBeLGOf4AAAADQZ4hBDCf/wdPnwAAAwABm0FY`;

  const js = `// Base64-encoded minimal black MP4 video
export const sampleVideoBase64 = "${minimalMp4Base64}";
export const sampleVideoDataUrl = \`data:video/mp4;base64,\${sampleVideoBase64}\`;
`;

  writeFileSync(join(__dirname, 'sample-video.js'), js);
  console.log('✓ Generated sample-video.js');
}

// Generate a README
function generateReadme() {
  const readme = `# Sample Media Assets

This directory contains sample media files for Storybook stories:

- **sample-audio.wav** - 2-second 440Hz sine wave (stereo, 44.1kHz)
- **sample-image.svg** - 1280x720 gradient image
- **sample-video.js** - Minimal MP4 video data URL

These files are generated programmatically and are used to demonstrate media upload components without external dependencies.

To regenerate these files, run:
\`\`\`bash
node generate-samples.js
\`\`\`
`;

  writeFileSync(join(__dirname, 'README.md'), readme);
  console.log('✓ Generated README.md');
}

// Run all generators
generateAudioFile();
generateImageFile();
generateVideoPlaceholder();
generateReadme();

console.log('\n✅ All sample media files generated successfully!');
