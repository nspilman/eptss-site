import React from "react";
import { FieldValues, UseFormRegister, Path } from "react-hook-form";
import * as styles from "./FormInput.css";
import * as inputStyles from "../InputField.css";
import { getFieldTestId } from "../testUtils";

interface Props<T extends FieldValues> {
  optional?: boolean;
  field: Path<T>;
  register: UseFormRegister<T>;
  type?: "email" | "text";
  placeholder: string;
  label: string;
}

export function TextInput<T extends FieldValues>({
  optional,
  field,
  register,
  type = "text",
  placeholder,
  label,
}: Props<T>) {
  const required = !optional;
  return (
    <div data-testid={getFieldTestId(field, "text")}>
      <label className={inputStyles.label}>{label}</label>
      <input
        className={styles.input}
        type={type}
        placeholder={placeholder}
        {...register(field, { required, maxLength: 300 })}
      />
    </div>
  );
}
