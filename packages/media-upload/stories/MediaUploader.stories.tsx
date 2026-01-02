import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { MediaUploader } from '../src';
import { ThemeSection } from './components/ThemeSection';
import { Text } from '@eptss/ui';

const meta: Meta<typeof MediaUploader> = {
  title: 'Media Upload/MediaUploader',
  component: MediaUploader,
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
    bucket: {
      control: 'text',
      description: 'Supabase bucket name',
    },
    accept: {
      control: 'object',
      description: 'File type accept pattern',
    },
    multiple: {
      control: 'boolean',
      description: 'Allow multiple file selection',
    },
    maxSizeMB: {
      control: 'number',
      description: 'Maximum file size in MB',
    },
    maxFiles: {
      control: 'number',
      description: 'Maximum number of files',
    },
    variant: {
      control: 'select',
      options: ['button', 'dropzone', 'both'],
      description: 'Upload interface variant',
    },
    autoUpload: {
      control: 'boolean',
      description: 'Automatically upload files when selected',
    },
    showPreview: {
      control: 'boolean',
      description: 'Show file previews',
    },
    enableCrop: {
      control: 'boolean',
      description: 'Enable image cropping for images',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
  args: {
    bucket: 'test-bucket',
    multiple: false,
    variant: 'both',
    autoUpload: true,
    showPreview: true,
    enableCrop: false,
    disabled: false,
  }
};

export default meta;
type Story = StoryObj<typeof MediaUploader>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[600px]">
      <MediaUploader
        {...args}
        onFilesSelected={(files) => console.log('Files selected:', files)}
        onUploadStart={(files) => console.log('Upload started:', files)}
        onUploadComplete={(results) => console.log('Upload complete:', results)}
        onUploadError={(errors) => console.error('Upload errors:', errors)}
      />
    </div>
  ),
};

export const ButtonOnly: Story = {
  args: {
    variant: 'button',
    buttonText: 'Upload Files',
  },
  render: (args) => (
    <div className="w-[600px]">
      <MediaUploader
        {...args}
        onFilesSelected={(files) => console.log('Files selected:', files)}
      />
    </div>
  ),
};

export const DropzoneOnly: Story = {
  args: {
    variant: 'dropzone',
    placeholder: 'Drag and drop your files here',
  },
  render: (args) => (
    <div className="w-[600px]">
      <MediaUploader
        {...args}
        onFilesSelected={(files) => console.log('Files selected:', files)}
      />
    </div>
  ),
};

export const AudioOnly: Story = {
  args: {
    accept: { 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'] },
    multiple: true,
    placeholder: 'Drop audio files here...',
    buttonText: 'Choose Audio Files',
  },
  render: (args) => (
    <div className="w-[600px]">
      <MediaUploader
        {...args}
        onFilesSelected={(files) => console.log('Audio files:', files)}
      />
    </div>
  ),
};

export const ImageOnly: Story = {
  args: {
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    multiple: true,
    placeholder: 'Drop images here...',
    buttonText: 'Choose Images',
  },
  render: (args) => (
    <div className="w-[600px]">
      <MediaUploader
        {...args}
        onFilesSelected={(files) => console.log('Images:', files)}
      />
    </div>
  ),
};

export const WithImageCrop: Story = {
  args: {
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    enableCrop: true,
    placeholder: 'Drop an image to crop...',
    buttonText: 'Choose Image to Crop',
  },
  render: (args) => (
    <div className="w-[700px]">
      <Text size="sm" color="muted" className="mb-4">
        Select an image to enable cropping before upload
      </Text>
      <MediaUploader
        {...args}
        onFilesSelected={(files) => console.log('Image selected:', files)}
        onUploadComplete={(results) => console.log('Cropped and uploaded:', results)}
      />
    </div>
  ),
};

export const WithFileSizeLimit: Story = {
  args: {
    maxSizeMB: 5,
    multiple: true,
    placeholder: 'Max 5MB per file',
  },
  render: (args) => (
    <div className="w-[600px]">
      <MediaUploader
        {...args}
        onFilesSelected={(files) => console.log('Valid files:', files)}
        onUploadError={(errors) => console.error('Errors:', errors)}
      />
    </div>
  ),
};

export const MaxFilesLimit: Story = {
  args: {
    multiple: true,
    maxFiles: 3,
    placeholder: 'Max 3 files',
  },
  render: (args) => (
    <div className="w-[600px]">
      <MediaUploader
        {...args}
        onFilesSelected={(files) => console.log('Files selected:', files)}
      />
    </div>
  ),
};

export const ManualUpload: Story = {
  args: {
    autoUpload: false,
    multiple: true,
    showPreview: true,
  },
  render: (args) => (
    <div className="w-[600px]">
      <Text size="sm" color="muted" className="mb-4">
        Files are not uploaded automatically. Click "Upload" button when ready.
      </Text>
      <MediaUploader
        {...args}
        onFilesSelected={(files) => console.log('Files selected:', files)}
        onUploadStart={(files) => console.log('Upload started:', files)}
      />
    </div>
  ),
};

export const WithoutPreview: Story = {
  args: {
    showPreview: false,
    multiple: true,
  },
  render: (args) => (
    <div className="w-[600px]">
      <MediaUploader
        {...args}
        onFilesSelected={(files) => console.log('Files selected:', files)}
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <div className="w-[600px]">
      <MediaUploader {...args} />
    </div>
  ),
};

export const AllExamples: Story = {
  render: () => (
    <ThemeSection
      title="Media Uploader"
      description="Complete file upload solution combining all upload functionality with validation, preview, and progress tracking."
    >
      <div className="flex flex-col gap-12 max-w-4xl">
        <div>
          <Text size="md" weight="semibold" className="mb-3">Default (Both Button & Dropzone)</Text>
          <MediaUploader
            bucket="test-bucket"
            onFilesSelected={(files) => console.log('Files:', files)}
          />
        </div>

        <div>
          <Text size="md" weight="semibold" className="mb-3">Button Only</Text>
          <MediaUploader
            bucket="test-bucket"
            variant="button"
            buttonText="Upload Files"
            onFilesSelected={(files) => console.log('Files:', files)}
          />
        </div>

        <div>
          <Text size="md" weight="semibold" className="mb-3">Dropzone Only</Text>
          <MediaUploader
            bucket="test-bucket"
            variant="dropzone"
            placeholder="Drag and drop files here"
            onFilesSelected={(files) => console.log('Files:', files)}
          />
        </div>

        <div>
          <Text size="md" weight="semibold" className="mb-3">Audio Files Only</Text>
          <MediaUploader
            bucket="test-bucket"
            accept={{ 'audio/*': ['.mp3', '.wav', '.ogg'] }}
            multiple
            placeholder="Drop audio files here..."
            buttonText="Choose Audio Files"
            onFilesSelected={(files) => console.log('Audio:', files)}
          />
        </div>

        <div>
          <Text size="md" weight="semibold" className="mb-3">Images with Cropping</Text>
          <Text size="sm" color="muted" className="mb-3">
            Select an image to enable cropping before upload
          </Text>
          <MediaUploader
            bucket="test-bucket"
            accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
            enableCrop
            placeholder="Drop image to crop..."
            onFilesSelected={(files) => console.log('Image:', files)}
          />
        </div>

        <div>
          <Text size="md" weight="semibold" className="mb-3">With File Size Limit (5MB)</Text>
          <MediaUploader
            bucket="test-bucket"
            maxSizeMB={5}
            multiple
            placeholder="Max 5MB per file"
            onFilesSelected={(files) => console.log('Valid:', files)}
          />
        </div>

        <div>
          <Text size="md" weight="semibold" className="mb-3">Max 3 Files</Text>
          <MediaUploader
            bucket="test-bucket"
            multiple
            maxFiles={3}
            placeholder="Max 3 files"
            onFilesSelected={(files) => console.log('Files:', files)}
          />
        </div>

        <div>
          <Text size="md" weight="semibold" className="mb-3">Manual Upload (No Auto-Upload)</Text>
          <Text size="sm" color="muted" className="mb-3">
            Select files first, then click upload button
          </Text>
          <MediaUploader
            bucket="test-bucket"
            autoUpload={false}
            multiple
            showPreview
            onFilesSelected={(files) => console.log('Files selected:', files)}
          />
        </div>

        <div>
          <Text size="md" weight="semibold" className="mb-3">Without Preview</Text>
          <MediaUploader
            bucket="test-bucket"
            showPreview={false}
            multiple
            onFilesSelected={(files) => console.log('Files:', files)}
          />
        </div>

        <div>
          <Text size="md" weight="semibold" className="mb-3">Disabled</Text>
          <MediaUploader
            bucket="test-bucket"
            disabled
          />
        </div>
      </div>
    </ThemeSection>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};

export const CustomExample: Story = {
  render: () => (
    <div className="w-full max-w-3xl">
      <Text size="xl" weight="bold" className="mb-2">
        Audio Submission Form
      </Text>
      <Text size="sm" color="muted" className="mb-6">
        Upload your audio tracks for review. Maximum 10MB per file.
      </Text>

      <MediaUploader
        bucket="audio-submissions"
        accept={{ 'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'] }}
        multiple
        maxFiles={5}
        maxSizeMB={10}
        variant="dropzone"
        placeholder="Drop up to 5 audio files here (max 10MB each)"
        autoUpload={false}
        showPreview
        onFilesSelected={(files) => {
          console.log(`${files.length} file(s) selected`);
        }}
        onUploadStart={(files) => {
          console.log('Starting upload for:', files);
        }}
        onUploadComplete={(results) => {
          console.log('All files uploaded:', results);
          alert('Upload complete! Your files have been submitted.');
        }}
        onUploadError={(errors) => {
          console.error('Upload errors:', errors);
        }}
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
