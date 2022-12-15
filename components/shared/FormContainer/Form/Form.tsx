import { FieldValues, useForm } from "react-hook-form";
import * as styles from "./Form.css";
import React from "react";
import { InputField } from "./InputField";
import { InputType } from "./types";

interface Props<T extends FieldValues> {
  onSubmit: (signupModel: T) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  fields: InputType<T>[];
}

export function Form<T extends FieldValues>({
  onSubmit,
  title,
  description = "",
  fields,
}: Props<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<T>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      {/* TODO - this should be outside the form */}
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.descriptionWrapper}>{description}</div>
      <div className={styles.formFieldWrapper}>
        {fields.map((field, i) => {
          return (
            <InputField
              key={i}
              field={field}
              register={register}
              errors={errors}
            />
          );
        })}
      </div>
      <button type="submit" data-testid="form-submission">
        Submit
      </button>
    </form>
  );
}
