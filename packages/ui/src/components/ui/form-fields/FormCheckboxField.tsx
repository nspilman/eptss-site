"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  Checkbox,
} from "../primitives";

interface FormCheckboxFieldProps {
  name: string;
  label: string;
  control: Control<any>;
  disabled?: boolean;
  description?: string;
  className?: string;
}

export function FormCheckboxField({
  name,
  label,
  control,
  disabled,
  description,
  className,
}: FormCheckboxFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className} id={`form-field-${name}`}>
          <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-[var(--color-border-primary)] p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={disabled}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>{label}</FormLabel>
              {description && <FormDescription>{description}</FormDescription>}
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
