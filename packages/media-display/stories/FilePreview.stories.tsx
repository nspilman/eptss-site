import React, { useState, useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { FilePreview } from '../src';
import { ThemeSection } from './components/ThemeSection';
import { Text } from '@eptss/ui';

// Helper functions to create sample files
const createSampleAudioFile = async (): Promise<File> => {
  const response = await fetch('/sample-audio.wav');
  const blob = await response.blob();
  return new File([blob], 'sample-audio.wav', { type: 'audio/wav', lastModified: Date.now() });
};

const createSampleImageFile = async (): Promise<File> => {
  const response = await fetch('/sample-image.jpg');
  const blob = await response.blob();
  return new File([blob], 'sample-image.jpg', { type: 'image/jpeg', lastModified: Date.now() });
};

const createSampleDocumentFile = (): File => {
  const content = 'This is a sample text document content.';
  const blob = new Blob([content], { type: 'text/plain' });
  return new File([blob], 'sample-document.txt', { type: 'text/plain', lastModified: Date.now() });
};

const createSamplePDFFile = (): File => {
  // Create a minimal PDF-like blob (not a real PDF, just for demo)
  const content = '%PDF-1.4 sample content';
  const blob = new Blob([content], { type: 'application/pdf' });
  return new File([blob], 'sample-document.pdf', { type: 'application/pdf', lastModified: Date.now() });
};

const meta: Meta<typeof FilePreview> = {
  title: 'Media Display/FilePreview',
  component: FilePreview,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  argTypes: {
    showRemove: {
      control: 'boolean',
      description: 'Show remove button',
    },
    showDetails: {
      control: 'boolean',
      description: 'Show file details (name, size)',
    },
    onRemove: {
      action: 'removed',
      description: 'Callback when remove is clicked',
    },
  },
  args: {
    showRemove: true,
    showDetails: true,
  },
};

export default meta;
type Story = StoryObj<typeof FilePreview>;

export const AudioFile: Story = {
  render: (args) => {
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleAudioFile().then(setFile);
    }, []);

    if (!file) {
      return <div className="w-96"><Text>Loading...</Text></div>;
    }

    return (
      <div className="w-96">
        <FilePreview {...args} file={file} />
      </div>
    );
  },
};

export const ImageFile: Story = {
  render: (args) => {
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleImageFile().then(setFile);
    }, []);

    if (!file) {
      return <div className="w-64"><Text>Loading...</Text></div>;
    }

    return (
      <div className="w-64">
        <FilePreview {...args} file={file} />
      </div>
    );
  },
};

export const DocumentFile: Story = {
  render: (args) => {
    const file = createSampleDocumentFile();

    return (
      <div className="w-96">
        <FilePreview {...args} file={file} />
      </div>
    );
  },
};

export const PDFFile: Story = {
  render: (args) => {
    const file = createSamplePDFFile();

    return (
      <div className="w-96">
        <FilePreview {...args} file={file} />
      </div>
    );
  },
};

export const WithRemoveButton: Story = {
  args: {
    showRemove: true,
  },
  render: (args) => {
    const [file, setFile] = useState<File | null>(null);
    const [removed, setRemoved] = useState(false);

    useEffect(() => {
      createSampleImageFile().then(setFile);
    }, []);

    if (!file) {
      return <div className="w-64"><Text>Loading...</Text></div>;
    }

    if (removed) {
      return (
        <div className="w-64 p-4 border border-dashed border-gray-600 rounded-lg text-center">
          <Text color="muted">File removed</Text>
          <button
            onClick={() => setRemoved(false)}
            className="mt-2 text-sm text-[var(--color-accent-primary)] underline"
          >
            Reset
          </button>
        </div>
      );
    }

    return (
      <div className="w-64">
        <FilePreview {...args} file={file} onRemove={() => setRemoved(true)} />
      </div>
    );
  },
};

export const WithoutDetails: Story = {
  args: {
    showDetails: false,
    showRemove: false,
  },
  render: (args) => {
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleImageFile().then(setFile);
    }, []);

    if (!file) {
      return <div className="w-64"><Text>Loading...</Text></div>;
    }

    return (
      <div className="w-64">
        <FilePreview {...args} file={file} />
      </div>
    );
  },
};

export const AllFileTypes: Story = {
  render: () => {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const documentFile = createSampleDocumentFile();
    const pdfFile = createSamplePDFFile();

    useEffect(() => {
      createSampleAudioFile().then(setAudioFile);
      createSampleImageFile().then(setImageFile);
    }, []);

    if (!audioFile || !imageFile) {
      return <div><Text>Loading samples...</Text></div>;
    }

    return (
      <ThemeSection
        title="File Preview"
        description="Smart preview component that renders appropriate preview based on file type. Supports audio (with waveform), images, videos, and documents."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <div>
            <Text size="sm" weight="medium" className="mb-3">Audio File</Text>
            <FilePreview file={audioFile} showRemove showDetails />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Image File</Text>
            <FilePreview file={imageFile} showRemove showDetails />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Text Document</Text>
            <FilePreview file={documentFile} showRemove showDetails />
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">PDF Document</Text>
            <FilePreview file={pdfFile} showRemove showDetails />
          </div>
        </div>
      </ThemeSection>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};
