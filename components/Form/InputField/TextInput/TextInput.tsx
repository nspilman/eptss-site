import React from "react";
import { FieldValues, UseFormRegister, Path } from "react-hook-form";

interface Props<T extends FieldValues> {
  optional?: boolean;
  field: Path<T>;
  type?: "email" | "text" | "password";
  placeholder: string;
  disabled?: boolean;
  defaultValue?: string | number;
}

export function TextInput<T extends FieldValues>({
  optional,
  field,
  type = "text",
  placeholder,
  disabled,
  defaultValue,
}: Props<T>) {
  const required = !optional;

  return (
    <input
      className="w-full bg-gray-700 text-gray-100 border-gray-600 focus:border-[#e2e240] focus:ring-[#e2e240] rounded-md"
      type={type}
      placeholder={placeholder}
      required={required}
      name={field}
      disabled={disabled}
      defaultValue={defaultValue}
    />
  );
}
