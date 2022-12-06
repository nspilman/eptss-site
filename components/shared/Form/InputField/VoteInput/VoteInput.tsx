import Link from "next/link";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";
import * as styles from "./VoteInput.css";

interface Props<T extends FieldValues> {
  register: UseFormRegister<T>;
  field: Path<T>;
  link: string;
  optional?: boolean;
}

export function VoteInput<T extends FieldValues>({
  register,
  field,
  link,
  optional,
}: Props<T>) {
  return (
    <div className={styles.voteOptions}>
      {["1", "2", "3", "4", "5"].map((value, i) => (
        <div key={i} className={styles.option}>
          <input
            {...register(field, { required: !optional })}
            type="radio"
            value={value}
            id={field + i}
          />
          <label htmlFor={field + i} className={styles.numberLabel}>
            {value}
          </label>
        </div>
      ))}
    </div>
  );
}
