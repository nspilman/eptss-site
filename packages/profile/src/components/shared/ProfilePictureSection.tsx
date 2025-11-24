'use client';

import { Button } from '@eptss/ui';
import { FormLabel } from '@eptss/ui';

interface ProfilePictureSectionProps {
  profilePictureUrl: string | null;
  isUploading: boolean;
  isDisabled?: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: () => void;
  showOptionalLabel?: boolean;
}

export function ProfilePictureSection({
  profilePictureUrl,
  isUploading,
  isDisabled = false,
  onUpload,
  onDelete,
  showOptionalLabel = false
}: ProfilePictureSectionProps) {
  return (
    <div className="space-y-4 pb-6 border-b border-gray-700">
      <FormLabel className="text-[var(--color-primary)] text-sm font-medium">
        Profile Picture {showOptionalLabel && <span className="text-xs text-gray-400 ml-2 font-normal">(Optional)</span>}
      </FormLabel>
      <div className="flex items-center gap-6">
        <div className="relative">
          {profilePictureUrl ? (
            <img
              src={profilePictureUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-[var(--color-accent-primary)]"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <label htmlFor="profile-picture-upload">
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={onUpload}
                disabled={isUploading || isDisabled}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                disabled={isUploading || isDisabled}
                className="bg-[var(--color-accent-primary)] hover:opacity-90 text-gray-900 cursor-pointer disabled:opacity-50"
                onClick={() => document.getElementById('profile-picture-upload')?.click()}
              >
                {isUploading ? 'Uploading...' : profilePictureUrl ? 'Change Photo' : 'Upload Photo'}
              </Button>
            </label>
            {profilePictureUrl && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={onDelete}
                disabled={isUploading || isDisabled}
              >
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            JPG, PNG, WebP or GIF. Max 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}
