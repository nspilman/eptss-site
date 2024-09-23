import { FieldValues } from "react-hook-form";
import { InputType } from "../types";
import { getFieldErrorId, getFieldTestId } from "./testUtils";
import { TextInput } from "./TextInput";
import { VoteInput } from "./VoteInput";
import Link from "next/link";

interface Props<T extends FieldValues> {
  field: InputType<T>;
  errors: any;
  disabled?: boolean;
}

export function InputField<T extends FieldValues>({
  field,
  errors,
  disabled,
}: Props<T>) {
  const { size, type, label, field: fieldId, optional } = field;
  const hasLink = "link" in field && field.link;
  return (
    <div
      className={`bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-4 border border-gray-700`}
      data-testid={getFieldTestId(field.field, type)}
    >
        <label className="text-gray-200 font-semibold mb-2 block">{`${label}`}</label>
      {type === "vote" ? (
        <VoteInput field={fieldId} />
      ) : (
        <TextInput
          field={fieldId}
          optional={optional}
          type={type}
          placeholder={field.placeholder}
          disabled={disabled}
          defaultValue={field.defaultValue}
        />
      )}
      <div>
        {errors[fieldId] ? (
          <p
            className="mt-2 text-sm text-red-600"
            data-testid={getFieldErrorId(fieldId)}
          >
            This field is required
          </p>
        ) : (
          <p>
            {hasLink && (
              <Link
                className="pt-4 font-semibold text-orange-600 shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
                href={field.link}
              >
                Listen Here
              </Link>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
