import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { FileInput } from '../src';
import { ThemeSection } from './components/ThemeSection';
import { Text } from '@eptss/ui';

const meta: Meta<typeof FileInput> = {
  title: 'Media Upload/FileInput',
  component: FileInput,
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
      control: 'text',
      description: 'File type accept pattern (e.g., "audio/*", "image/*")',
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file selection',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    buttonText: {
      control: 'text',
      description: 'Button text',
    },
    showIcon: {
      control: 'boolean',
      description: 'Show upload icon',
    },
  },
  args: {
    multiple: false,
    disabled: false,
    buttonText: 'Choose Files',
    showIcon: true,
  }
};

export default meta;
type Story = StoryObj<typeof FileInput>;

export const Default: Story = {
  render: (args) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    return (
      <div className="flex flex-col gap-4">
        <FileInput
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

export const AudioOnly: Story = {
  render: (args) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    return (
      <div className="flex flex-col gap-4">
        <FileInput
          {...args}
          accept="audio/*"
          buttonText="Choose Audio File"
          onFilesSelected={(files) => {
            setSelectedFiles(files);
          }}
        />
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <Text size="sm" weight="medium">Selected audio files:</Text>
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
      <div className="flex flex-col gap-4">
        <FileInput
          {...args}
          accept="image/*"
          buttonText="Choose Image"
          onFilesSelected={(files) => {
            setSelectedFiles(files);
          }}
        />
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <Text size="sm" weight="medium">Selected images:</Text>
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
      <div className="flex flex-col gap-4">
        <FileInput
          {...args}
          multiple
          buttonText="Choose Multiple Files"
          onFilesSelected={(files) => {
            setSelectedFiles(files);
          }}
        />
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <Text size="sm" weight="medium">{selectedFiles.length} files selected:</Text>
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

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithoutIcon: Story = {
  args: {
    showIcon: false,
    buttonText: 'Select File',
  },
};

export const CustomText: Story = {
  args: {
    buttonText: 'Upload Document',
    accept: '.pdf,.doc,.docx',
  },
};

export const AllExamples: Story = {
  render: () => (
    <ThemeSection
      title="File Input"
      description="Simple file input component with customizable button interface."
    >
      <div className="flex flex-col gap-8 max-w-2xl">
        <div>
          <Text size="sm" weight="medium" className="mb-3">Default</Text>
          <FileInput onFilesSelected={(files) => console.log('Files:', files)} />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Audio Only</Text>
          <FileInput
            accept="audio/*"
            buttonText="Choose Audio File"
            onFilesSelected={(files) => console.log('Audio:', files)}
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Image Only</Text>
          <FileInput
            accept="image/*"
            buttonText="Choose Image"
            onFilesSelected={(files) => console.log('Images:', files)}
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Multiple Files</Text>
          <FileInput
            multiple
            buttonText="Choose Multiple Files"
            onFilesSelected={(files) => console.log('Multiple:', files)}
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Without Icon</Text>
          <FileInput
            showIcon={false}
            buttonText="Select File"
            onFilesSelected={(files) => console.log('Files:', files)}
          />
        </div>

        <div>
          <Text size="sm" weight="medium" className="mb-3">Disabled</Text>
          <FileInput disabled />
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
