import React, { useState, useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { AudioPreview, FileInput } from '../src';
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
  title: 'Media Upload/AudioPreview',
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

export const InteractiveExample: Story = {
  render: () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    return (
      <div className="w-full max-w-2xl">
        <Text size="lg" weight="semibold" className="mb-4">
          Select an audio file to preview
        </Text>

        <FileInput
          accept="audio/*"
          onFilesSelected={(files) => {
            if (files.length > 0) {
              setSelectedFile(files[0]);
            }
          }}
          buttonText="Choose Audio File"
        />

        {selectedFile && (
          <div className="mt-6">
            <Text size="sm" weight="medium" className="mb-3">
              Audio Preview:
            </Text>
            <AudioPreview file={selectedFile} showWaveform />
          </div>
        )}

        {!selectedFile && (
          <div className="mt-6">
            <Text size="sm" color="muted">
              Select an audio file (.mp3, .wav, .ogg, etc.) to see the interactive waveform
              and playback controls.
            </Text>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};

export const MultipleAudioFiles: Story = {
  render: () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    return (
      <div className="w-full max-w-3xl">
        <Text size="lg" weight="semibold" className="mb-4">
          Select multiple audio files
        </Text>

        <FileInput
          accept="audio/*"
          multiple
          onFilesSelected={(files) => {
            setSelectedFiles(files);
          }}
          buttonText="Choose Audio Files"
        />

        {selectedFiles.length > 0 && (
          <div className="mt-6 space-y-6">
            <Text size="sm" weight="medium">
              {selectedFiles.length} audio file{selectedFiles.length > 1 ? 's' : ''}:
            </Text>
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`}>
                <AudioPreview file={file} showWaveform />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
  parameters: {
    layout: 'padded',
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
        description="Audio player with waveform visualization powered by WaveSurfer.js."
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

          <div className="mt-8">
            <Text size="md" weight="semibold" className="mb-3">
              Interactive Example
            </Text>
            <Text size="sm" color="muted" className="mb-4">
              See the "Interactive Example" story to select and preview your own audio files
            </Text>
          </div>
        </div>
      </ThemeSection>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
