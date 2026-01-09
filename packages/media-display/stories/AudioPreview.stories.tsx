import React, { useState, useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { AudioPreview } from '../src';
import { ThemeSection } from './components/ThemeSection';
import { Text } from '@eptss/ui';

// Helper to fetch and create a real audio File from the sample asset
const createSampleAudioFile = async (): Promise<File> => {
  const response = await fetch('/sample-audio.wav');
  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
  }
  const blob = await response.blob();
  return new File([blob], 'sample-audio.wav', { type: 'audio/wav', lastModified: Date.now() });
};

const meta: Meta<typeof AudioPreview> = {
  title: 'Media Display/AudioPreview',
  component: AudioPreview,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      options: [
        { name: 'dark', value: '#0a0a14' },
        { name: 'light', value: '#ffffff' }
      ]
    },
  },
  argTypes: {
    showWaveform: {
      control: 'boolean',
      description: 'Show waveform visualization',
    },
    waveColor: {
      control: 'color',
      description: 'Waveform color',
    },
    progressColor: {
      control: 'color',
      description: 'Progress color',
    },
    height: {
      control: { type: 'range', min: 50, max: 200, step: 10 },
      description: 'Waveform height in pixels',
    },
    onEnded: {
      action: 'ended',
      description: 'Callback when audio playback ends',
    },
  },
  args: {
    showWaveform: true,
    height: 80,
  }
};

export default meta;
type Story = StoryObj<typeof AudioPreview>;

export const Default: Story = {
  render: (args) => {
    const [audioFile, setAudioFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleAudioFile().then(setAudioFile);
    }, []);

    if (!audioFile) {
      return <div className="w-96"><Text>Loading audio sample...</Text></div>;
    }

    return (
      <div className="w-96">
        <AudioPreview {...args} file={audioFile} />
      </div>
    );
  },
};

export const WithURL: Story = {
  render: (args) => {
    return (
      <div className="w-96">
        <AudioPreview
          {...args}
          src="/sample-audio.wav"
          title="Sample Audio Track"
        />
      </div>
    );
  },
};

export const WithoutWaveform: Story = {
  args: {
    showWaveform: false,
  },
  render: (args) => {
    const [audioFile, setAudioFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleAudioFile().then(setAudioFile);
    }, []);

    if (!audioFile) {
      return <div className="w-96"><Text>Loading audio sample...</Text></div>;
    }

    return (
      <div className="w-96">
        <AudioPreview {...args} file={audioFile} />
      </div>
    );
  },
};

export const CustomHeight: Story = {
  args: {
    height: 120,
  },
  render: (args) => {
    const [audioFile, setAudioFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleAudioFile().then(setAudioFile);
    }, []);

    if (!audioFile) {
      return <div className="w-96"><Text>Loading audio sample...</Text></div>;
    }

    return (
      <div className="w-96">
        <AudioPreview {...args} file={audioFile} />
      </div>
    );
  },
};

export const CustomColors: Story = {
  args: {
    waveColor: '#a855f7',
    progressColor: '#e2e240',
  },
  render: (args) => {
    const [audioFile, setAudioFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleAudioFile().then(setAudioFile);
    }, []);

    if (!audioFile) {
      return <div className="w-96"><Text>Loading audio sample...</Text></div>;
    }

    return (
      <div className="w-96">
        <AudioPreview {...args} file={audioFile} />
      </div>
    );
  },
};

export const WithOnEndedCallback: Story = {
  render: (args) => {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [playCount, setPlayCount] = useState(0);

    useEffect(() => {
      createSampleAudioFile().then(setAudioFile);
    }, []);

    if (!audioFile) {
      return <div className="w-96"><Text>Loading audio sample...</Text></div>;
    }

    return (
      <div className="w-96">
        <Text size="sm" className="mb-3">
          Play count: {playCount} (plays until the end trigger the callback)
        </Text>
        <AudioPreview
          {...args}
          file={audioFile}
          onEnded={() => setPlayCount((c) => c + 1)}
        />
      </div>
    );
  },
};

export const AllExamples: Story = {
  render: () => {
    const [audioFile, setAudioFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleAudioFile().then(setAudioFile);
    }, []);

    if (!audioFile) {
      return <div><Text>Loading audio samples...</Text></div>;
    }

    return (
      <ThemeSection
        title="Audio Preview"
        description="Audio player with waveform visualization powered by WaveSurfer.js. Includes onEnded callback for playlist integration."
      >
        <div className="flex flex-col gap-8 max-w-2xl">
          <div>
            <Text size="sm" weight="medium" className="mb-3">Default (with waveform)</Text>
            <AudioPreview file={audioFile} showWaveform />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Without waveform</Text>
            <AudioPreview file={audioFile} showWaveform={false} />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Custom height (120px)</Text>
            <AudioPreview file={audioFile} showWaveform height={120} />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Custom colors</Text>
            <AudioPreview
              file={audioFile}
              showWaveform
              waveColor="#a855f7"
              progressColor="#e2e240"
            />
            <Text size="xs" color="muted" className="mt-2">
              Purple waveform with yellow progress
            </Text>
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Using URL instead of File</Text>
            <AudioPreview
              src="/sample-audio.wav"
              title="Sample Audio from URL"
              showWaveform
            />
          </div>
        </div>
      </ThemeSection>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
