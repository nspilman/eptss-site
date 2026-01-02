import React, { useState, useEffect } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ImageCropper, FileInput } from '../src';
import { ThemeSection } from './components/ThemeSection';
import { Text, Button } from '@eptss/ui';

// Helper to fetch and create a real image File from the sample asset
const createSampleImageFile = async (): Promise<File> => {
  const response = await fetch('/sample-image.jpg');
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  const blob = await response.blob();
  return new File([blob], 'sample-image.jpg', { type: 'image/jpeg', lastModified: Date.now() });
};

const meta: Meta<typeof ImageCropper> = {
  title: 'Media Upload/ImageCropper',
  component: ImageCropper,
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
    aspectRatio: {
      control: 'number',
      description: 'Aspect ratio constraint (e.g., 16/9, 1, 4/3)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ImageCropper>;

export const FreeAspect: Story = {
  render: (args) => {
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleImageFile().then(setImageFile);
    }, []);

    if (!imageFile) {
      return <div className="w-[600px]"><Text>Loading image sample...</Text></div>;
    }

    return (
      <div className="w-[600px]">
        <ImageCropper
          {...args}
          file={imageFile}
          onCropComplete={(file) => console.log('Cropped:', file)}
          onCancel={() => console.log('Cancelled')}
        />
      </div>
    );
  },
};

export const SquareAspect: Story = {
  args: {
    aspectRatio: 1,
  },
  render: (args) => {
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleImageFile().then(setImageFile);
    }, []);

    if (!imageFile) {
      return <div className="w-[600px]"><Text>Loading image sample...</Text></div>;
    }

    return (
      <div className="w-[600px]">
        <Text size="sm" color="muted" className="mb-4">
          1:1 aspect ratio (square)
        </Text>
        <ImageCropper
          {...args}
          file={imageFile}
          onCropComplete={(file) => console.log('Cropped:', file)}
          onCancel={() => console.log('Cancelled')}
        />
      </div>
    );
  },
};

export const WideAspect: Story = {
  args: {
    aspectRatio: 16 / 9,
  },
  render: (args) => {
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleImageFile().then(setImageFile);
    }, []);

    if (!imageFile) {
      return <div className="w-[600px]"><Text>Loading image sample...</Text></div>;
    }

    return (
      <div className="w-[600px]">
        <Text size="sm" color="muted" className="mb-4">
          16:9 aspect ratio (wide)
        </Text>
        <ImageCropper
          {...args}
          file={imageFile}
          onCropComplete={(file) => console.log('Cropped:', file)}
          onCancel={() => console.log('Cancelled')}
        />
      </div>
    );
  },
};

export const InteractiveExample: Story = {
  render: () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [croppedFile, setCroppedFile] = useState<File | null>(null);
    const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

    const handleCropComplete = (file: File) => {
      setCroppedFile(file);
      setSelectedFile(null);
    };

    const handleCancel = () => {
      setSelectedFile(null);
    };

    return (
      <div className="w-full max-w-3xl">
        <Text size="lg" weight="semibold" className="mb-4">
          Image Cropper
        </Text>

        {!selectedFile && !croppedFile && (
          <div className="space-y-4">
            <FileInput
              accept="image/*"
              onFilesSelected={(files) => {
                if (files.length > 0) {
                  setSelectedFile(files[0]);
                  setCroppedFile(null);
                }
              }}
              buttonText="Choose Image to Crop"
            />

            <div className="mt-4">
              <Text size="sm" weight="medium" className="mb-2">
                Aspect Ratio:
              </Text>
              <div className="flex gap-2">
                <Button size="sm" variant={aspectRatio === undefined ? 'default' : 'outline'} onClick={() => setAspectRatio(undefined)}>
                  Free
                </Button>
                <Button size="sm" variant={aspectRatio === 1 ? 'default' : 'outline'} onClick={() => setAspectRatio(1)}>
                  Square (1:1)
                </Button>
                <Button size="sm" variant={aspectRatio === 16/9 ? 'default' : 'outline'} onClick={() => setAspectRatio(16/9)}>
                  Wide (16:9)
                </Button>
                <Button size="sm" variant={aspectRatio === 4/3 ? 'default' : 'outline'} onClick={() => setAspectRatio(4/3)}>
                  Classic (4:3)
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedFile && (
          <div className="mt-6">
            <ImageCropper
              file={selectedFile}
              aspectRatio={aspectRatio}
              onCropComplete={handleCropComplete}
              onCancel={handleCancel}
            />
          </div>
        )}

        {croppedFile && !selectedFile && (
          <div className="mt-6">
            <Text size="sm" weight="medium" className="mb-3">
              Cropped Image:
            </Text>
            <img
              src={URL.createObjectURL(croppedFile)}
              alt="Cropped"
              className="max-w-full h-auto rounded-lg border border-[var(--color-gray-700)]"
            />
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setCroppedFile(null);
                }}
              >
                Choose Another Image
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const url = URL.createObjectURL(croppedFile);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = croppedFile.name;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Download Cropped Image
              </Button>
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

export const AllExamples: Story = {
  render: () => {
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
      createSampleImageFile().then(setImageFile);
    }, []);

    if (!imageFile) {
      return <div><Text>Loading image samples...</Text></div>;
    }

    return (
      <ThemeSection
        title="Image Cropper"
        description="Image cropping interface using react-image-crop with real sample images."
      >
        <div className="flex flex-col gap-8 max-w-3xl">
          <div>
            <Text size="sm" weight="medium" className="mb-3">Free Aspect Ratio</Text>
            <Text size="xs" color="muted" className="mb-3">
              Crop image to any aspect ratio
            </Text>
            <div className="w-full">
              <ImageCropper
                file={imageFile}
                onCropComplete={(file) => console.log('Cropped:', file)}
                onCancel={() => console.log('Cancelled')}
              />
            </div>
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Square (1:1)</Text>
            <Text size="xs" color="muted" className="mb-3">
              Perfect for profile pictures and avatars
            </Text>
            <div className="w-full">
              <ImageCropper
                file={imageFile}
                aspectRatio={1}
                onCropComplete={(file) => console.log('Cropped:', file)}
                onCancel={() => console.log('Cancelled')}
              />
            </div>
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Wide (16:9)</Text>
            <Text size="xs" color="muted" className="mb-3">
              Great for banners and cover images
            </Text>
            <div className="w-full">
              <ImageCropper
                file={imageFile}
                aspectRatio={16 / 9}
                onCropComplete={(file) => console.log('Cropped:', file)}
                onCancel={() => console.log('Cancelled')}
              />
            </div>
          </div>

          <div>
            <Text size="sm" weight="medium" className="mb-3">Classic (4:3)</Text>
            <Text size="xs" color="muted" className="mb-3">
              Traditional photo aspect ratio
            </Text>
            <div className="w-full">
              <ImageCropper
                file={imageFile}
                aspectRatio={4 / 3}
                onCropComplete={(file) => console.log('Cropped:', file)}
                onCancel={() => console.log('Cancelled')}
              />
            </div>
          </div>

          <div className="mt-8">
            <Text size="md" weight="semibold" className="mb-3">
              Interactive Example
            </Text>
            <Text size="sm" color="muted" className="mb-4">
              See the "Interactive Example" story above to try cropping your own images with different aspect ratios
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
