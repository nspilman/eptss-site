/**
 * ImageCropper Component
 * Image cropping interface using react-image-crop
 */

import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { clsx } from 'clsx';

export interface ImageCropperProps {
  /** Image file to crop */
  file: File;
  /** Initial crop (optional) */
  initialCrop?: Crop;
  /** Aspect ratio (optional, e.g., 16/9, 1, 4/3) */
  aspectRatio?: number;
  /** Callback when crop is complete */
  onCropComplete?: (croppedFile: File) => void;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  file,
  initialCrop,
  aspectRatio,
  onCropComplete,
  onCancel,
  className,
}) => {
  const [crop, setCrop] = useState<Crop | undefined>(initialCrop);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const handleCropComplete = async () => {
    if (!completedCrop || !imageRef.current) return;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      imageRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;

      const croppedFile = new File([blob], file.name, {
        type: file.type,
        lastModified: Date.now(),
      });

      onCropComplete?.(croppedFile);
    }, file.type);
  };

  return (
    <div className={clsx('flex flex-col gap-4', className)}>
      {/* Crop Area */}
      <div className="max-h-[500px] overflow-auto bg-[var(--color-gray-700)] rounded-lg p-4">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspectRatio}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="max-w-full h-auto"
          />
        </ReactCrop>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={clsx(
              'px-4 py-2 rounded-md',
              'border border-[var(--color-gray-700)]',
              'text-sm font-medium text-[var(--color-primary)]',
              'hover:bg-[var(--color-gray-700)]',
              'transition-colors duration-200'
            )}
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleCropComplete}
          disabled={!completedCrop}
          className={clsx(
            'px-4 py-2 rounded-md',
            'bg-[var(--color-accent-primary)] text-[var(--color-background-primary)]',
            'text-sm font-medium',
            'hover:opacity-90',
            'transition-opacity duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          Apply Crop
        </button>
      </div>
    </div>
  );
};
