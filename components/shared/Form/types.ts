import { Path } from "react-hook-form";

interface BaseField<T> {
  label: string;
  field: Path<T>;
  optional?: boolean;
  size?: "small" | "large";
}

export interface TextField<T> extends BaseField<T> {
  type?: "text" | "email";
  placeholder: string;
}

export interface VoteField<T> extends BaseField<T> {
  type: "vote";
  label: string;
}

export type InputType<T> = TextField<T> | VoteField<T>;
