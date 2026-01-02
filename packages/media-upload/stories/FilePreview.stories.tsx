import React, { useState, useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { FilePreview, FileInput } from '../src';
import { ThemeSection } from './components/ThemeSection';
import { Text } from '@eptss/ui';

// Helper to fetch and create real media files from sample assets
const createSampleAudioFile = async (): Promise<File> => {
  const response = await fetch('/sample-audio.wav');
  if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);
  const blob = await response.blob();
  return new File([blob], 'sample-audio.wav', { type: 'audio/wav', lastModified: Date.now() });
};

const createSampleImageFile = async (): Promise<File> => {
  const response = await fetch('/sample-image.jpg');
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  const blob = await response.blob();
  return new File([blob], 'sample-image.jpg', { type: 'image/jpeg', lastModified: Date.now() });
};

// Helper to create mock File objects for non-media types
const createMockFile = (name: string, type: string, size: number): File => {
  const blob = new Blob(['Mock file content'], { type });
  return new File([blob], name, { type, lastModified: Date.now() });
};

const meta: Meta<typeof FilePreview> = {
  title: 'Media Upload/FilePreview',
  component: FilePreview,
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
    showRemove: {
      control: 'boolean',
      description: 'Show remove button',
    },
    showDetails: {
      control: 'boolean',
      description: 'Show file details',
    },
  },
  args: {
    showRemove: false,
    showDetails: true,
  }
};

export default meta;
type Story = StoryObj<typeof FilePreview>;

export const AudioFile: Story = {
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
        <FilePreview
          {...args}
          file={audioFile}
          onRemove={() => console.log('Remove clicked')}
        />
      </div>
    );
  },
  args: {
    showRemove: true,
  },
};

export const ImageFile: Story = {
  render: (args) => {
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleImageFile().then(setImageFile);
    }, []);

    if (!imageFile) {
      return <div className="w-96"><Text>Loading image sample...</Text></div>;
    }

    return (
      <div className="w-96">
        <FilePreview
          {...args}
          file={imageFile}
          onRemove={() => console.log('Remove clicked')}
        />
      </div>
    );
  },
  args: {
    showRemove: true,
  },
};

export const VideoFile: Story = {
  render: (args) => {
    const videoFile = createMockFile('sample-video.mp4', 'video/mp4', 10 * 1024 * 1024);

    return (
      <div className="w-96">
        <FilePreview
          {...args}
          file={videoFile}
          onRemove={() => console.log('Remove clicked')}
        />
      </div>
    );
  },
  args: {
    showRemove: true,
  },
};

export const DocumentFile: Story = {
  render: (args) => {
    const docFile = createMockFile('sample-document.pdf', 'application/pdf', 500 * 1024);

    return (
      <div className="w-96">
        <FilePreview
          {...args}
          file={docFile}
          onRemove={() => console.log('Remove clicked')}
        />
      </div>
    );
  },
  args: {
    showRemove: true,
  },
};

export const GenericFile: Story = {
  render: (args) => {
    const genericFile = createMockFile('data.json', 'application/json', 50 * 1024);

    return (
      <div className="w-96">
        <FilePreview
          {...args}
          file={genericFile}
          onRemove={() => console.log('Remove clicked')}
        />
      </div>
    );
  },
  args: {
    showRemove: true,
  },
};

export const WithoutRemoveButton: Story = {
  render: (args) => {
    const file = createMockFile('locked-file.pdf', 'application/pdf', 500 * 1024);

    return (
      <div className="w-96">
        <FilePreview
          {...args}
          file={file}
        />
      </div>
    );
  },
  args: {
    showRemove: false,
  },
};

export const WithoutDetails: Story = {
  render: (args) => {
    const file = createMockFile('minimal-preview.pdf', 'application/pdf', 500 * 1024);

    return (
      <div className="w-96">
        <FilePreview
          {...args}
          file={file}
        />
      </div>
    );
  },
  args: {
    showDetails: false,
    showRemove: true,
  },
};

export const InteractiveExample: Story = {
  render: () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    return (
      <div className="w-full max-w-3xl">
        <Text size="lg" weight="semibold" className="mb-4">
          Select files to preview
        </Text>

        <FileInput
          multiple
          onFilesSelected={(files) => setSelectedFiles(files)}
          buttonText="Choose Files to Preview"
        />

        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <Text size="sm" weight="medium" className="mb-3">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected:
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedFiles.map((file, index) => (
                <FilePreview
                  key={`${file.name}-${index}`}
                  file={file}
                  showRemove
                  onRemove={() => {
                    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};

export const AllFileTypes: Story = {
  render: () => {
    const files = [
      createMockFile('audio-track.mp3', 'audio/mpeg', 3 * 1024 * 1024),
      createMockFile('photo.jpg', 'image/jpeg', 1.5 * 1024 * 1024),
      createMockFile('video-clip.mp4', 'video/mp4', 10 * 1024 * 1024),
      createMockFile('presentation.pdf', 'application/pdf', 500 * 1024),
      createMockFile('data.json', 'application/json', 50 * 1024),
      createMockFile('archive.zip', 'application/zip', 2 * 1024 * 1024),
    ];

    return (
      <ThemeSection
        title="File Preview"
        description="Smart preview component that renders appropriate previews based on file type."
      >
        <div className="flex flex-col gap-8 max-w-3xl">
          <div>
            <Text size="sm" weight="medium" className="mb-3">Audio File</Text>
            <FilePreview file={files[0]} showRemove onRemove={() => console.log('Remove audio')} />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Image File</Text>
            <FilePreview file={files[1]} showRemove onRemove={() => console.log('Remove image')} />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Video File</Text>
            <FilePreview file={files[2]} showRemove onRemove={() => console.log('Remove video')} />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">PDF Document</Text>
            <FilePreview file={files[3]} showRemove onRemove={() => console.log('Remove pdf')} />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Generic File</Text>
            <FilePreview file={files[4]} showRemove onRemove={() => console.log('Remove json')} />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Archive File</Text>
            <FilePreview file={files[5]} showRemove onRemove={() => console.log('Remove zip')} />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Without Remove Button</Text>
            <FilePreview file={files[3]} showRemove={false} />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Without Details</Text>
            <FilePreview file={files[3]} showDetails={false} showRemove />
          </div>
        </div>
      </ThemeSection>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
