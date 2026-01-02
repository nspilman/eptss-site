import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { FileDropzone } from '../src';
import { ThemeSection } from './components/ThemeSection';
import { Text } from '@eptss/ui';

const meta: Meta<typeof FileDropzone> = {
  title: 'Media Upload/FileDropzone',
  component: FileDropzone,
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
    accept: {
      control: 'object',
      description: 'File type accept pattern (Record<string, string[]> or string)',
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file selection',
    },
    maxSize: {
      control: 'number',
      description: 'Maximum file size in bytes',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    placeholder: {
      control: 'text',
      description: 'Custom placeholder text',
    },
  },
  args: {
    multiple: false,
    disabled: false,
  }
};

export default meta;
type Story = StoryObj<typeof FileDropzone>;

export const Default: Story = {
  render: (args) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    return (
      <div className="w-96 flex flex-col gap-4">
        <FileDropzone
          {...args}
          onFilesSelected={(files) => {
            setSelectedFiles(files);
            console.log('Files selected:', files);
          }}
        />
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <Text size="sm" weight="medium">Selected files:</Text>
            <ul className="mt-2 space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index}>
                  <Text size="xs" color="muted">{file.name} ({(file.size / 1024).toFixed(2)} KB)</Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};

export const AudioOnly: Story = {
  render: (args) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    return (
      <div className="w-96 flex flex-col gap-4">
        <FileDropzone
          {...args}
          accept={{ 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'] }}
          placeholder="Drop audio files here..."
          onFilesSelected={(files) => {
            setSelectedFiles(files);
          }}
        />
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <Text size="sm" weight="medium">Audio files:</Text>
            <ul className="mt-2 space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index}>
                  <Text size="xs" color="muted">{file.name}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};

export const ImageOnly: Story = {
  render: (args) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    return (
      <div className="w-96 flex flex-col gap-4">
        <FileDropzone
          {...args}
          accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
          placeholder="Drop images here..."
          onFilesSelected={(files) => {
            setSelectedFiles(files);
          }}
        />
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <Text size="sm" weight="medium">Images:</Text>
            <ul className="mt-2 space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index}>
                  <Text size="xs" color="muted">{file.name}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};

export const MultipleFiles: Story = {
  render: (args) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    return (
      <div className="w-96 flex flex-col gap-4">
        <FileDropzone
          {...args}
          multiple
          onFilesSelected={(files) => {
            setSelectedFiles((prev) => [...prev, ...files]);
          }}
        />
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <Text size="sm" weight="medium">{selectedFiles.length} files selected:</Text>
            <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <li key={index}>
                  <Text size="xs" color="muted">{file.name}</Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};

export const WithMaxSize: Story = {
  render: (args) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string>('');

    return (
      <div className="w-96 flex flex-col gap-4">
        <FileDropzone
          {...args}
          maxSize={5 * 1024 * 1024} // 5MB
          placeholder="Max 5MB per file"
          onFilesSelected={(files) => {
            setError('');
            setSelectedFiles(files);
          }}
        />
        {error && (
          <Text size="sm" className="text-red-500">{error}</Text>
        )}
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <Text size="sm" weight="medium">Valid files:</Text>
            <ul className="mt-2 space-y-1">
              {selectedFiles.map((file, index) => (
                <li key={index}>
                  <Text size="xs" color="muted">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </Text>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <div className="w-96">
      <FileDropzone {...args} />
    </div>
  ),
};

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Drop your files here to upload',
  },
  render: (args) => (
    <div className="w-96">
      <FileDropzone {...args} onFilesSelected={(files) => console.log(files)} />
    </div>
  ),
};

export const AllExamples: Story = {
  render: () => (
    <ThemeSection
      title="File Dropzone"
      description="Drag-and-drop file upload zone with validation and visual feedback."
    >
      <div className="flex flex-col gap-8 max-w-3xl">
        <div>
          <Text size="sm" weight="medium" className="mb-3">Default</Text>
          <FileDropzone onFilesSelected={(files) => console.log('Files:', files)} />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Audio Only</Text>
          <FileDropzone
            accept={{ 'audio/*': ['.mp3', '.wav', '.ogg'] }}
            placeholder="Drop audio files here..."
            onFilesSelected={(files) => console.log('Audio:', files)}
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Image Only</Text>
          <FileDropzone
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
            placeholder="Drop images here..."
            onFilesSelected={(files) => console.log('Images:', files)}
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Multiple Files</Text>
          <FileDropzone
            multiple
            onFilesSelected={(files) => console.log('Multiple:', files)}
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">With Max Size (5MB)</Text>
          <FileDropzone
            maxSize={5 * 1024 * 1024}
            placeholder="Max 5MB per file"
            onFilesSelected={(files) => console.log('Valid:', files)}
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Disabled</Text>
          <FileDropzone disabled />
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
