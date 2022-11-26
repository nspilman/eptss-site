import classnames from "classnames";
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
  return (
    <div
      className={classnames(
        styles.container,
        size === "small" ? styles.small : styles.large
      )}
      data-testid={getFieldTestId(field.field, type)}
    >
      <label className={styles.label}>{label}</label>
      {type === "vote" ? (
        <VoteInput register={register} field={fieldId} />
      ) : (
        <TextInput
          register={register}
          field={fieldId}
          optional={optional}
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
