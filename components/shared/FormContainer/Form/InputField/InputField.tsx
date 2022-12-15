import classnames from "classnames";
import Link from "next/link";
import { FieldValues, UseFormRegister } from "react-hook-form";
import { InputType } from "../types";
import * as styles from "./InputField.css";
import { getFieldErrorId, getFieldTestId } from "./testUtils";
import { TextInput } from "./TextInput";
import { VoteInput } from "./VoteInput";

interface Props<T extends FieldValues> {
  field: InputType<T>;
  register: UseFormRegister<T>;
  errors: any;
}

export function InputField<T extends FieldValues>({
  field,
  errors,
  register,
}: Props<T>) {
  const { size, type, label, field: fieldId, optional } = field;
  const hasLink = "link" in field;
  return (
    <div
      className={classnames(
        styles.container,
        size === "small" ? styles.small : styles.large
      )}
      data-testid={getFieldTestId(field.field, type)}
    >
      <div className={styles.labelWrapper}>
        <label className={styles.label}>{`${label}`}</label>
        {hasLink && (
          <div className={styles.linkWrapper}>
            <a target="_blank" rel="noopener noreferrer" href={field.link}>
              listen
            </a>
          </div>
        )}
      </div>
      {type === "vote" ? (
        <VoteInput register={register} field={fieldId} link={field.link} />
      ) : (
        <TextInput
          register={register}
          field={fieldId}
          optional={optional}
          type={type}
          placeholder={field.placeholder}
        />
      )}
      <div className={styles.errorContainer}>
        {errors[fieldId] && (
          <span
            data-testid={getFieldErrorId(fieldId)}
            className={styles.errorMessage}
          >
            This field is required
          </span>
        )}
      </div>
    </div>
  );
}
