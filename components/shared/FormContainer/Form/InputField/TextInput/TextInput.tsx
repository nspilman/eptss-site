import React from "react";
import { FieldValues, UseFormRegister, Path } from "react-hook-form";
import * as styles from "./FormInput.css";
import * as inputStyles from "../InputField.css";

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
      className={styles.input}
      type={type}
      placeholder={placeholder}
      {...register(field, { required, maxLength: 1000 })}
    />
  );
}
