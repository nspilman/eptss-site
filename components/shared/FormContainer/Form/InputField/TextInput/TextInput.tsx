import React from "react";
import { FieldValues, UseFormRegister, Path } from "react-hook-form";
import { Input } from "@chakra-ui/react";

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
    <Input
      bg="white"
      borderRadius="xl"
      color="blackAlpha.800"
      type={type}
      placeholder={placeholder}
      isRequired={required}
      {...register(field, { required, maxLength: 1000 })}
    />
  );
}
