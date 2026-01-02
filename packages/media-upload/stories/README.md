# Media Upload Storybook

This directory contains Storybook stories for all visual components in the `@eptss/media-upload` package.

## Running Storybook

From the `packages/media-upload` directory:

```bash
# Install dependencies first if needed
npm install
# or
bun install

# Start Storybook
npm run storybook
# or
bun run storybook
```

Storybook will run on **http://localhost:6007** (different from UI package which runs on 6006).

## Stories Included

- **FileInput** - Button-based file selection
- **FileDropzone** - Drag-and-drop upload zone
- **FilePreview** - Type-specific file previews
- **UploadProgress** - Individual file upload progress
- **UploadQueue** - Multi-file upload queue
- **AudioPreview** - Audio player with waveform
- **ImageCropper** - Image cropping interface
- **MediaUploader** - Complete upload orchestrator

## Story Structure

Each story file includes:
- **Meta configuration** - Component metadata, args, argTypes
- **Basic stories** - Default states and variants
- **Interactive stories** - User-driven examples with real file selection
- **Showcase stories** - Complete feature demonstrations

## Testing with Real Files

Many components work best with real files:

- **AudioPreview** - Select .mp3, .wav, or .ogg files to see waveform visualization
- **ImageCropper** - Select image files to test cropping functionality
- **FilePreview** - Upload different file types to see type-specific previews
- **MediaUploader** - Complete upload workflows with validation

## Building Storybook

To build a static version of Storybook:

```bash
npm run build-storybook
# or
bun run build-storybook
```

The static build will be in `storybook-static/`.

## Components Directory

The `components/` subdirectory contains shared components used across stories:

- **ThemeSection** - Styled section wrapper for showcases

## Notes

- Stories import from `../src` (the source code in this package)
- UI library components are imported from `@eptss/ui`
- Mock file objects are used for demonstration, but real files provide better testing
- All callbacks log to the browser console for debugging
