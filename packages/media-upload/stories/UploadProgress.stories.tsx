import React, { useState, useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { UploadProgress } from '../src';
import { ThemeSection } from './components/ThemeSection';
import { Text } from '@eptss/ui';

const meta: Meta<typeof UploadProgress> = {
  title: 'Media Upload/UploadProgress',
  component: UploadProgress,
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
    fileName: {
      control: 'text',
      description: 'Name of the file being uploaded',
    },
    fileSize: {
      control: 'number',
      description: 'File size in bytes',
    },
    progress: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Upload progress (0-100)',
    },
    status: {
      control: 'select',
      options: ['idle', 'validating', 'uploading', 'success', 'error', 'cancelled'],
      description: 'Upload status',
    },
    showCancel: {
      control: 'boolean',
      description: 'Show cancel button',
    },
    showRetry: {
      control: 'boolean',
      description: 'Show retry button (for error state)',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
  },
  args: {
    fileName: 'sample-audio.mp3',
    fileSize: 3 * 1024 * 1024,
    progress: 50,
    status: 'uploading',
    showCancel: true,
    showRetry: true,
  }
};

export default meta;
type Story = StoryObj<typeof UploadProgress>;

export const Idle: Story = {
  args: {
    status: 'idle',
    progress: 0,
  },
  render: (args) => (
    <div className="w-96">
      <UploadProgress {...args} />
    </div>
  ),
};

export const Validating: Story = {
  args: {
    status: 'validating',
    progress: 0,
  },
  render: (args) => (
    <div className="w-96">
      <UploadProgress {...args} />
    </div>
  ),
};

export const Uploading: Story = {
  args: {
    status: 'uploading',
    progress: 65,
  },
  render: (args) => (
    <div className="w-96">
      <UploadProgress {...args} />
    </div>
  ),
};

export const Success: Story = {
  args: {
    status: 'success',
    progress: 100,
  },
  render: (args) => (
    <div className="w-96">
      <UploadProgress {...args} />
    </div>
  ),
};

export const Error: Story = {
  args: {
    status: 'error',
    progress: 45,
    error: 'Upload failed: Network error',
  },
  render: (args) => (
    <div className="w-96">
      <UploadProgress
        {...args}
        onRetry={() => console.log('Retry clicked')}
      />
    </div>
  ),
};

export const Cancelled: Story = {
  args: {
    status: 'cancelled',
    progress: 30,
  },
  render: (args) => (
    <div className="w-96">
      <UploadProgress {...args} />
    </div>
  ),
};

export const WithoutCancelButton: Story = {
  args: {
    status: 'uploading',
    progress: 50,
    showCancel: false,
  },
  render: (args) => (
    <div className="w-96">
      <UploadProgress {...args} />
    </div>
  ),
};

export const LargeFile: Story = {
  args: {
    fileName: 'very-long-filename-with-many-characters-video-recording.mp4',
    fileSize: 150 * 1024 * 1024, // 150MB
    status: 'uploading',
    progress: 35,
  },
  render: (args) => (
    <div className="w-96">
      <UploadProgress {...args} />
    </div>
  ),
};

export const AnimatedProgress: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'validating' | 'uploading' | 'success' | 'error' | 'cancelled'>('idle');

    useEffect(() => {
      // Validating phase
      setTimeout(() => setStatus('validating'), 500);

      // Start uploading
      setTimeout(() => setStatus('uploading'), 1500);

      // Progress animation
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStatus('success');
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="w-96">
        <UploadProgress
          fileName="animated-upload.mp3"
          fileSize={3 * 1024 * 1024}
          progress={progress}
          status={status}
          showCancel={status !== 'success'}
          onCancel={() => {
            setStatus('cancelled');
            setProgress(progress);
          }}
        />
      </div>
    );
  },
};

export const MultipleStates: Story = {
  render: () => (
    <ThemeSection
      title="Upload Progress"
      description="Progress indicator for individual file uploads with various states."
    >
      <div className="flex flex-col gap-6 max-w-2xl">
        <div>
          <Text size="sm" weight="medium" className="mb-3">Idle</Text>
          <UploadProgress
            fileName="idle-file.mp3"
            fileSize={3 * 1024 * 1024}
            progress={0}
            status="idle"
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Validating</Text>
          <UploadProgress
            fileName="validating-file.mp3"
            fileSize={3 * 1024 * 1024}
            progress={0}
            status="validating"
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Uploading (25%)</Text>
          <UploadProgress
            fileName="uploading-file-1.mp3"
            fileSize={3 * 1024 * 1024}
            progress={25}
            status="uploading"
            showCancel
            onCancel={() => console.log('Cancel')}
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Uploading (75%)</Text>
          <UploadProgress
            fileName="uploading-file-2.mp3"
            fileSize={3 * 1024 * 1024}
            progress={75}
            status="uploading"
            showCancel
            onCancel={() => console.log('Cancel')}
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Success</Text>
          <UploadProgress
            fileName="success-file.mp3"
            fileSize={3 * 1024 * 1024}
            progress={100}
            status="success"
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Error</Text>
          <UploadProgress
            fileName="error-file.mp3"
            fileSize={3 * 1024 * 1024}
            progress={45}
            status="error"
            error="Upload failed: Network connection lost"
            showRetry
            onRetry={() => console.log('Retry')}
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Cancelled</Text>
          <UploadProgress
            fileName="cancelled-file.mp3"
            fileSize={3 * 1024 * 1024}
            progress={30}
            status="cancelled"
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Large File</Text>
          <UploadProgress
            fileName="very-long-filename-with-many-characters-recording.mp4"
            fileSize={150 * 1024 * 1024}
            progress={35}
            status="uploading"
            showCancel
            onCancel={() => console.log('Cancel')}
          />
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
