'use client';

import { Input } from '@eptss/ui';
import { Label } from '@eptss/ui';

interface DisplayNameFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  isDisabled?: boolean;
  showEditableLabel?: boolean;
}

export function DisplayNameField({
  value,
  onChange,
  placeholder,
  isDisabled = false,
  showEditableLabel = false
}: DisplayNameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="publicDisplayName" className="text-[var(--color-primary)] text-sm font-medium flex items-center gap-2">
        Public Display Name
        {showEditableLabel && (
          <span className="text-xs text-[var(--color-accent-primary)] font-normal">(editable)</span>
        )}
      </Label>
      <Input
        id="publicDisplayName"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={isDisabled}
        className="bg-gray-800 border-gray-700 text-[var(--color-primary)] focus:border-[var(--color-accent-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}
