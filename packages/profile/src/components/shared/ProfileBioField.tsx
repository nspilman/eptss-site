'use client';

import { Textarea } from '@eptss/ui';
import { Label } from '@eptss/ui';

interface ProfileBioFieldProps {
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  showEditableLabel?: boolean;
  showBorder?: boolean;
}

export function ProfileBioField({
  value,
  onChange,
  isDisabled = false,
  showEditableLabel = false,
  showBorder = true
}: ProfileBioFieldProps) {
  return (
    <div className={`space-y-2 ${showBorder ? 'pt-4 border-t border-gray-700' : ''}`}>
      <Label htmlFor="profileBio" className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-2">
        Profile Bio
        <span className="text-xs text-gray-400 ml-2 font-normal">(Optional{showBorder ? ', shown on public profile' : ''})</span>
        {showEditableLabel && (
          <span className="text-xs text-[var(--color-accent-primary)] font-normal">(editable)</span>
        )}
      </Label>
      <Textarea
        id="profileBio"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tell people a bit about yourself and your music..."
        rows={4}
        disabled={isDisabled}
        className="bg-gray-800 border-gray-700 text-[var(--color-primary)] focus:border-[var(--color-accent-primary)] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <p className="text-xs text-gray-500">{value.length}/1000 characters</p>
    </div>
  );
}
