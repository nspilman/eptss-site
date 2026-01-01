# @eptss/media-upload

A comprehensive, production-ready media upload package for Supabase storage with built-in UI components, validation, and progress tracking.

## Features

- 🎵 **Audio-first design** - Optimized for audio files with waveform visualization
- 📁 **All file types** - Supports audio, images, videos, and documents
- 🎯 **Drag-and-drop** - Modern drag-and-drop interface with visual feedback
- 📤 **Multiple uploads** - Queue management for concurrent file uploads
- ✅ **Validation** - Client and server-side file validation
- 📊 **Progress tracking** - Real-time upload progress with cancel/retry
- 🖼️ **Preview & Crop** - File previews with optional image cropping
- 🎨 **Customizable** - Flexible API with component composition
- 🔒 **Type-safe** - Full TypeScript support
- ⚡ **Framework-ready** - Works with Next.js App Router and React

## Installation

This package is part of the EPTSS monorepo and depends on:

```json
{
  "@eptss/bucket-storage": "workspace:*",
  "@eptss/ui": "workspace:*",
  "react-dropzone": "^14.3.5",
  "wavesurfer.js": "^7.8.14",
  "react-image-crop": "^11.0.7"
}
```

## Quick Start

### Basic Usage

```tsx
import { MediaUploader } from '@eptss/media-upload';

function MyComponent() {
  return (
    <MediaUploader
      bucket="audio-files"
      accept="audio/*"
      maxSizeMB={50}
      multiple
      onUploadComplete={(results) => {
        console.log('Uploaded files:', results);
      }}
    />
  );
}
```

### Audio Upload with Custom Path

```tsx
import { MediaUploader } from '@eptss/media-upload';

function AudioUpload({ projectId, userId }) {
  return (
    <MediaUploader
      bucket="project-audio"
      accept="audio/*"
      maxSizeMB={100}
      multiple
      generatePath={(userId, fileName, file) =>
        `projects/${projectId}/${userId}/${fileName}`
      }
      onUploadComplete={(results) => {
        // Save URLs to database
        results.forEach(result => {
          console.log('Uploaded:', result.url);
        });
      }}
    />
  );
}
```

### Image Upload with Cropping

```tsx
import { MediaUploader } from '@eptss/media-upload';

function ProfilePictureUpload() {
  return (
    <MediaUploader
      bucket="profile-pictures"
      accept="image/*"
      maxSizeMB={5}
      enableCrop
      showPreview
      variant="dropzone"
      onUploadComplete={([result]) => {
        // Update profile picture URL
        updateProfilePicture(result.url);
      }}
    />
  );
}
```

### Manual Upload Control

```tsx
import { MediaUploader } from '@eptss/media-upload';

function ManualUpload() {
  return (
    <MediaUploader
      bucket="documents"
      accept={['application/pdf', 'image/*']}
      maxSizeMB={10}
      multiple
      autoUpload={false} // Don't auto-upload
      onFilesSelected={(files) => {
        console.log('Files selected:', files);
      }}
      onUploadComplete={(results) => {
        console.log('Upload complete:', results);
      }}
    />
  );
}
```

## API Reference

### MediaUploader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bucket` | `string` | **required** | Supabase storage bucket name |
| `accept` | `string \| string[]` | `undefined` | Allowed file types (MIME types or extensions) |
| `maxSizeMB` | `number` | `undefined` | Maximum file size in megabytes |
| `minSizeMB` | `number` | `undefined` | Minimum file size in megabytes |
| `multiple` | `boolean` | `false` | Allow multiple file uploads |
| `maxFiles` | `number` | `undefined` | Maximum number of files |
| `variant` | `'button' \| 'dropzone' \| 'both'` | `'both'` | UI variant to display |
| `showPreview` | `boolean` | `true` | Show file preview after selection |
| `enableCrop` | `boolean` | `false` | Enable image cropping (images only) |
| `generatePath` | `PathGenerator` | auto-generated | Custom path generation function |
| `customValidator` | `(file: File) => string \| null` | `undefined` | Custom validation function |
| `onUploadStart` | `(files: File[]) => void` | `undefined` | Callback when upload starts |
| `onUploadProgress` | `(progress: UploadProgress[]) => void` | `undefined` | Callback for progress updates |
| `onUploadComplete` | `(results: UploadResult[]) => void` | `undefined` | Callback when uploads complete |
| `onUploadError` | `(error: UploadError) => void` | `undefined` | Callback when upload fails |
| `onFilesSelected` | `(files: File[]) => void` | `undefined` | Callback when files are selected |
| `autoUpload` | `boolean` | `true` | Auto-upload on file selection |
| `disabled` | `boolean` | `false` | Disable the uploader |
| `placeholder` | `string` | auto-generated | Placeholder text for dropzone |
| `buttonText` | `string` | `"Choose Files"` | Button text for file picker |
| `className` | `string` | `undefined` | Additional CSS classes |

### Accepted File Types

```tsx
// Audio files (primary use case)
accept="audio/*"
accept={['audio/mp3', 'audio/wav', 'audio/m4a']}

// Images
accept="image/*"
accept={['image/jpeg', 'image/png', 'image/webp']}

// Videos
accept="video/*"

// Documents
accept="application/pdf"
accept={['application/pdf', 'text/plain']}

// Multiple types
accept={['audio/*', 'image/*', 'video/*']}
```

## Component Composition

For advanced use cases, you can compose individual components:

### Custom Upload UI

```tsx
import {
  FileDropzone,
  FilePreview,
  UploadQueue,
  useUploadQueue,
  useFileValidation
} from '@eptss/media-upload';

function CustomUploader() {
  const [files, setFiles] = useState<File[]>([]);

  const { filterValid } = useFileValidation({
    maxSizeMB: 50,
    accept: 'audio/*',
  });

  const uploadQueue = useUploadQueue({
    bucket: 'audio-files',
  });

  const handleFilesSelected = (selectedFiles: File[]) => {
    const { validFiles } = filterValid(selectedFiles);
    setFiles(validFiles);
    uploadQueue.addFiles(validFiles);
  };

  return (
    <div>
      <FileDropzone
        accept="audio/*"
        multiple
        onFilesSelected={handleFilesSelected}
      />

      {files.map((file, i) => (
        <FilePreview key={i} file={file} />
      ))}

      <UploadQueue items={uploadQueue.items} />

      <button onClick={() => uploadQueue.uploadAll()}>
        Upload All
      </button>
    </div>
  );
}
```

## Hooks

### useMediaUpload

Hook for single file upload with progress tracking.

```tsx
import { useMediaUpload } from '@eptss/media-upload';

function SingleFileUpload() {
  const { upload, progress, status, result } = useMediaUpload({
    bucket: 'audio-files',
    onComplete: (result) => console.log('Uploaded:', result),
  });

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
        }}
      />
      {status === 'uploading' && <p>Progress: {progress}%</p>}
      {result && <p>URL: {result.url}</p>}
    </div>
  );
}
```

### useUploadQueue

Hook for managing multiple file uploads.

```tsx
import { useUploadQueue } from '@eptss/media-upload';

function MultiFileUpload() {
  const queue = useUploadQueue({
    bucket: 'documents',
    maxConcurrent: 3,
  });

  const handleUpload = (files: File[]) => {
    queue.addFiles(files);
    queue.uploadAll();
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => handleUpload(Array.from(e.target.files || []))}
      />

      {queue.items.map(item => (
        <div key={item.id}>
          {item.file.name}: {item.progress}%
          <button onClick={item.cancel}>Cancel</button>
        </div>
      ))}
    </div>
  );
}
```

### useFileValidation

Hook for file validation.

```tsx
import { useFileValidation } from '@eptss/media-upload';

function ValidatedUpload() {
  const { validate, filterValid } = useFileValidation({
    maxSizeMB: 10,
    accept: 'audio/*',
  });

  const handleFiles = (files: File[]) => {
    const { validFiles, errors } = filterValid(files);
    console.log('Valid:', validFiles);
    console.log('Errors:', errors);
  };

  return <input type="file" multiple onChange={(e) => handleFiles(Array.from(e.target.files || []))} />;
}
```

## Server Actions

For custom upload logic, use the server actions directly:

```tsx
import { uploadMediaFile, uploadMediaFiles } from '@eptss/media-upload';

// Single file
const { result, error } = await uploadMediaFile(
  'audio-files',
  file,
  'path/to/file.mp3',
  {
    validateSize: 50, // MB
    validateType: 'audio/*',
  }
);

// Multiple files
const { results, errors } = await uploadMediaFiles(
  'audio-files',
  files,
  (file) => `uploads/${file.name}`,
  {
    validateSize: 50,
    validateType: 'audio/*',
  }
);
```

## Setting Up Storage Buckets

Before using the media-upload package, ensure your Supabase buckets are created:

```typescript
// In your setup script or API route
import { createClient } from '@eptss/data-access/utils/supabase/server';

async function setupMediaBuckets() {
  const supabase = await createClient();

  // Create audio bucket
  await supabase.storage.createBucket('audio-files', {
    public: true,
    fileSizeLimit: 104857600, // 100MB
    allowedMimeTypes: [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/m4a',
      'audio/aac',
      'audio/ogg',
      'audio/flac',
    ],
  });

  // Create other buckets as needed...
}
```

## Styling

The package uses Tailwind CSS with CSS variables from your theme. All components respect your project's color scheme:

- `--color-primary`
- `--color-accent-primary`
- `--color-accent-secondary`
- `--color-background-primary`
- `--color-gray-400`, `--color-gray-700`

Components are fully customizable via the `className` prop.

## Best Practices

### 1. Audio Files

```tsx
<MediaUploader
  bucket="audio-files"
  accept="audio/*"
  maxSizeMB={100} // Audio files can be large
  multiple
  showPreview // Shows audio player with waveform
/>
```

### 2. Profile Pictures

```tsx
<MediaUploader
  bucket="profile-pictures"
  accept="image/*"
  maxSizeMB={5}
  enableCrop // Let users crop their image
  variant="dropzone"
  generatePath={(userId, fileName) => `${userId}/avatar.jpg`}
/>
```

### 3. Project Media

```tsx
<MediaUploader
  bucket="project-media"
  accept={['audio/*', 'image/*', 'video/*']}
  maxSizeMB={200}
  multiple
  maxFiles={10}
  generatePath={(userId, fileName, file) =>
    `projects/${projectId}/${userId}/${Date.now()}-${fileName}`
  }
/>
```

### 4. Custom Validation

```tsx
<MediaUploader
  bucket="documents"
  customValidator={(file) => {
    if (file.name.includes('test')) {
      return 'Test files are not allowed';
    }
    return null; // Valid
  }}
/>
```

## TypeScript Support

All components and hooks are fully typed:

```tsx
import type {
  MediaUploaderProps,
  UploadResult,
  UploadError,
  UploadProgress,
  FileCategory,
} from '@eptss/media-upload';
```

## License

Private - Part of EPTSS monorepo
