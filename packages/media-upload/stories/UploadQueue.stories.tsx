import React, { useState, useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { UploadQueue } from '../src';
import type { UploadQueueItem } from '../src';
import { ThemeSection } from './components/ThemeSection';
import { Text } from '@eptss/ui';

// Helper to create mock File objects
const createMockFile = (name: string, type: string, size: number): File => {
  const blob = new Blob(['Mock file content'], { type });
  return new File([blob], name, { type, lastModified: Date.now() });
};

// Helper to create mock queue items
const createMockQueueItem = (
  id: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  progress: number,
  status: 'idle' | 'validating' | 'uploading' | 'success' | 'error' | 'cancelled',
  error?: string
): UploadQueueItem => ({
  id,
  file: createMockFile(fileName, fileType, fileSize),
  progress,
  status,
  error: error ? { message: error, code: 'UPLOAD_ERROR' } : undefined,
  cancel: () => console.log(`Cancel ${id}`),
  retry: () => console.log(`Retry ${id}`),
});

const meta: Meta<typeof UploadQueue> = {
  title: 'Media Upload/UploadQueue',
  component: UploadQueue,
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
    showCancel: {
      control: 'boolean',
      description: 'Show cancel buttons',
    },
    showRetry: {
      control: 'boolean',
      description: 'Show retry buttons',
    },
    maxVisible: {
      control: 'number',
      description: 'Maximum items to display',
    },
  },
  args: {
    showCancel: true,
    showRetry: true,
  }
};

export default meta;
type Story = StoryObj<typeof UploadQueue>;

export const SingleFile: Story = {
  args: {
    items: [
      createMockQueueItem(
        '1',
        'audio-track.mp3',
        'audio/mpeg',
        3 * 1024 * 1024,
        65,
        'uploading'
      ),
    ],
  },
  render: (args) => (
    <div className="w-[500px]">
      <UploadQueue {...args} />
    </div>
  ),
};

export const MultipleFiles: Story = {
  args: {
    items: [
      createMockQueueItem('1', 'audio-track-1.mp3', 'audio/mpeg', 3 * 1024 * 1024, 100, 'success'),
      createMockQueueItem('2', 'audio-track-2.mp3', 'audio/mpeg', 4 * 1024 * 1024, 75, 'uploading'),
      createMockQueueItem('3', 'audio-track-3.mp3', 'audio/mpeg', 2 * 1024 * 1024, 30, 'uploading'),
    ],
  },
  render: (args) => (
    <div className="w-[500px]">
      <UploadQueue {...args} />
    </div>
  ),
};

export const MixedStates: Story = {
  args: {
    items: [
      createMockQueueItem('1', 'completed.mp3', 'audio/mpeg', 3 * 1024 * 1024, 100, 'success'),
      createMockQueueItem('2', 'uploading.mp3', 'audio/mpeg', 4 * 1024 * 1024, 65, 'uploading'),
      createMockQueueItem('3', 'validating.mp3', 'audio/mpeg', 2 * 1024 * 1024, 0, 'validating'),
      createMockQueueItem('4', 'failed.mp3', 'audio/mpeg', 5 * 1024 * 1024, 45, 'error', 'Network error'),
      createMockQueueItem('5', 'cancelled.mp3', 'audio/mpeg', 3 * 1024 * 1024, 20, 'cancelled'),
    ],
  },
  render: (args) => (
    <div className="w-[500px]">
      <UploadQueue {...args} />
    </div>
  ),
};

export const WithMaxVisible: Story = {
  args: {
    items: [
      createMockQueueItem('1', 'file-1.mp3', 'audio/mpeg', 3 * 1024 * 1024, 100, 'success'),
      createMockQueueItem('2', 'file-2.mp3', 'audio/mpeg', 3 * 1024 * 1024, 100, 'success'),
      createMockQueueItem('3', 'file-3.mp3', 'audio/mpeg', 3 * 1024 * 1024, 85, 'uploading'),
      createMockQueueItem('4', 'file-4.mp3', 'audio/mpeg', 3 * 1024 * 1024, 65, 'uploading'),
      createMockQueueItem('5', 'file-5.mp3', 'audio/mpeg', 3 * 1024 * 1024, 30, 'uploading'),
    ],
    maxVisible: 3,
  },
  render: (args) => (
    <div className="w-[500px]">
      <UploadQueue {...args} />
    </div>
  ),
};

export const WithoutCancelButtons: Story = {
  args: {
    items: [
      createMockQueueItem('1', 'uploading-1.mp3', 'audio/mpeg', 3 * 1024 * 1024, 75, 'uploading'),
      createMockQueueItem('2', 'uploading-2.mp3', 'audio/mpeg', 4 * 1024 * 1024, 50, 'uploading'),
    ],
    showCancel: false,
  },
  render: (args) => (
    <div className="w-[500px]">
      <UploadQueue {...args} />
    </div>
  ),
};

export const AnimatedQueue: Story = {
  render: () => {
    const [items, setItems] = useState<UploadQueueItem[]>([
      createMockQueueItem('1', 'file-1.mp3', 'audio/mpeg', 3 * 1024 * 1024, 0, 'uploading'),
      createMockQueueItem('2', 'file-2.mp3', 'audio/mpeg', 4 * 1024 * 1024, 0, 'uploading'),
      createMockQueueItem('3', 'file-3.mp3', 'audio/mpeg', 2 * 1024 * 1024, 0, 'uploading'),
    ]);

    useEffect(() => {
      const interval = setInterval(() => {
        setItems((prevItems) =>
          prevItems.map((item) => {
            if (item.status === 'uploading' && item.progress < 100) {
              return { ...item, progress: Math.min(item.progress + 5, 100) };
            }
            if (item.status === 'uploading' && item.progress >= 100) {
              return { ...item, status: 'success' as const };
            }
            return item;
          })
        );
      }, 200);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="w-[500px]">
        <UploadQueue items={items} showCancel showRetry />
      </div>
    );
  },
};

export const AllExamples: Story = {
  render: () => (
    <ThemeSection
      title="Upload Queue"
      description="Display a list of files being uploaded with their progress and status."
    >
      <div className="flex flex-col gap-8 max-w-2xl">
        <div>
          <Text size="sm" weight="medium" className="mb-3">Single File</Text>
          <UploadQueue
            items={[
              createMockQueueItem('1', 'audio-track.mp3', 'audio/mpeg', 3 * 1024 * 1024, 65, 'uploading'),
            ]}
            showCancel
            showRetry
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Multiple Files - All Uploading</Text>
          <UploadQueue
            items={[
              createMockQueueItem('1', 'file-1.mp3', 'audio/mpeg', 3 * 1024 * 1024, 90, 'uploading'),
              createMockQueueItem('2', 'file-2.mp3', 'audio/mpeg', 4 * 1024 * 1024, 65, 'uploading'),
              createMockQueueItem('3', 'file-3.mp3', 'audio/mpeg', 2 * 1024 * 1024, 30, 'uploading'),
            ]}
            showCancel
            showRetry
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Mixed States</Text>
          <UploadQueue
            items={[
              createMockQueueItem('1', 'completed.mp3', 'audio/mpeg', 3 * 1024 * 1024, 100, 'success'),
              createMockQueueItem('2', 'uploading.mp3', 'audio/mpeg', 4 * 1024 * 1024, 65, 'uploading'),
              createMockQueueItem('3', 'validating.mp3', 'audio/mpeg', 2 * 1024 * 1024, 0, 'validating'),
              createMockQueueItem('4', 'failed.mp3', 'audio/mpeg', 5 * 1024 * 1024, 45, 'error', 'Network connection lost'),
              createMockQueueItem('5', 'cancelled.mp3', 'audio/mpeg', 3 * 1024 * 1024, 20, 'cancelled'),
            ]}
            showCancel
            showRetry
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">With Max Visible (3 of 5 shown)</Text>
          <UploadQueue
            items={[
              createMockQueueItem('1', 'file-1.mp3', 'audio/mpeg', 3 * 1024 * 1024, 100, 'success'),
              createMockQueueItem('2', 'file-2.mp3', 'audio/mpeg', 3 * 1024 * 1024, 100, 'success'),
              createMockQueueItem('3', 'file-3.mp3', 'audio/mpeg', 3 * 1024 * 1024, 85, 'uploading'),
              createMockQueueItem('4', 'file-4.mp3', 'audio/mpeg', 3 * 1024 * 1024, 65, 'uploading'),
              createMockQueueItem('5', 'file-5.mp3', 'audio/mpeg', 3 * 1024 * 1024, 30, 'uploading'),
            ]}
            maxVisible={3}
            showCancel
            showRetry
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Without Cancel Buttons</Text>
          <UploadQueue
            items={[
              createMockQueueItem('1', 'locked-1.mp3', 'audio/mpeg', 3 * 1024 * 1024, 75, 'uploading'),
              createMockQueueItem('2', 'locked-2.mp3', 'audio/mpeg', 4 * 1024 * 1024, 50, 'uploading'),
            ]}
            showCancel={false}
            showRetry
          />
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
