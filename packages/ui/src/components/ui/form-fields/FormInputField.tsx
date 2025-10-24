"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
  Input,
} from "../primitives";

interface FormInputFieldProps {
  name: string;
  label: string;
  control: Control<any>;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  description?: string;
  className?: string;
  autoComplete?: string;
}

export function FormInputField({
  name,
  label,
  control,
  disabled,
  placeholder,
  type = "text",
  description,
  className,
  autoComplete,
}: FormInputFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className} id={`form-field-${name}`}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              disabled={disabled}
              placeholder={placeholder}
              autoComplete={autoComplete}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
