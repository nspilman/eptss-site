import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
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
    <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="w-full max-w-md mx-auto"
  >
    <Input
      type={type}
      id={field}
      name={field}
      placeholder={placeholder}
      defaultValue={defaultValue}
      disabled={disabled}
      required={required}
      className="w-full bg-gray-800 bg-opacity-50 text-gray-100 border-gray-700 rounded-md focus:border-[#e2e240] focus:ring-[#e2e240] focus:ring-opacity-50 placeholder-gray-500"
    />
  </motion.div>
  );
}


