import { FieldValues, Path, UseFormRegister } from "react-hook-form";
import * as inputStyles from "../InputField.css";
import { getFieldTestId } from "../testUtils";
import * as styles from "./VoteInput.css";

interface Props<T extends FieldValues> {
  register: UseFormRegister<T>;
  label: string;
  field: Path<T>;
  optional?: boolean;
}

export function VoteInput<T extends FieldValues>({
  register,
  label,
  field,
  optional,
}: Props<T>) {
  return (
    <div data-testid={getFieldTestId(field, "vote")}>
      <label className={inputStyles.label}>{label}</label>
      <div className={styles.voteOptions}>
        {["1", "2", "3", "4", "5"].map((value, i) => (
          <div key={i}>
            <input
              {...register(field, { required: !optional })}
              type="radio"
              value={value}
              id={label + i}
            />
            <label htmlFor={label + i}>{value}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
