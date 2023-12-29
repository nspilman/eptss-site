import React from "react";
import { FieldValues, UseFormRegister, Path } from "react-hook-form";

interface Props<T extends FieldValues> {
  optional?: boolean;
  field: Path<T>;
  register: UseFormRegister<T>;
  type?: "email" | "text" | "password";
  placeholder: string;
}

export function TextInput<T extends FieldValues>({
  optional,
  field,
  register,
  type = "text",
  placeholder,
}: Props<T>) {
  const required = !optional;

  return (
    <input
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      type={type}
      placeholder={placeholder}
      required={required}
      {...register(field, { required, maxLength: 1000 })}
    />
  );
}
