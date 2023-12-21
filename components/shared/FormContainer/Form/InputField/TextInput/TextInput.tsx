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
      className="bg-white text-black rounded-lg w-full"
      type={type}
      placeholder={placeholder}
      required={required}
      {...register(field, { required, maxLength: 1000 })}
    />
  );
}
