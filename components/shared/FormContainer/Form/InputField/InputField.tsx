import { FieldValues, UseFormRegister } from "react-hook-form";
import { InputType } from "../types";
import { getFieldErrorId, getFieldTestId } from "./testUtils";
import { TextInput } from "./TextInput";
import { VoteInput } from "./VoteInput";
import Link from "next/link";

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
  const hasLink = "link" in field && field.link;
  const isSmall = size === "small";
  return (
    <div
      className={`flex flex-col bg-gray-50 my-2 mx-1 p-4 rounded-2xl flex-1 min-w-[100px] sm:min-w-[${
        isSmall ? "250px" : "400px"
      }]`}
      data-testid={getFieldTestId(field.field, type)}
    >
      <div>
        <label className="text-md font-semibold pb-2">{`${label}`}</label>
      </div>
      {type === "vote" ? (
        <VoteInput register={register} field={fieldId} />
      ) : (
        <TextInput
          register={register}
          field={fieldId}
          optional={optional}
          type={type}
          placeholder={field.placeholder}
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
