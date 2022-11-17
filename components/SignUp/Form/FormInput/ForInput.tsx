import React from "react";
import { FormField, SignupModel } from "../../types";
import { UseFormRegister } from "react-hook-form";
import * as styles from "./FormInput.css";
import classnames from "classnames";

interface Props {
  optional?: boolean;
  field: FormField;
  register: UseFormRegister<SignupModel>;
  errors: any;
  type?: "email" | "text";
  placeholder: string;
  label: string;
  size?: "small" | "large";
}

export const FormInput = ({
  optional,
  field,
  register,
  errors,
  type = "text",
  placeholder,
  label,
  size = "small",
}: Props) => {
  const required = !optional;
  return (
    <div
      className={classnames(
        styles.container,
        size === "small" ? styles.small : styles.large
      )}
    >
      <label className={styles.label}>{label}</label>
      <input
        className={styles.input}
        type={type}
        placeholder={placeholder}
        {...register(field, { required, maxLength: 300 })}
      />
      <div className={styles.errorContainer}>
        {errors[field] && (
          <span className={styles.errorMessage}>This field is required</span>
        )}
      </div>
    </div>
  );
};
