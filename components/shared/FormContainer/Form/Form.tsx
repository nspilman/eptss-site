import { FieldValues, useForm } from "react-hook-form";
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
    <div className=" w-full flex-col items-center justify-center">
      <div className="flex flex-col text-center font-fraunces">
        <h1 className="py-4 text-center font-bold text-white text-lg">
          {title}
        </h1>
        <div className="text-white">{description}</div>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-center items-center"
      >
        <div className="flex flex-wrap flex-col ">
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
        <button
          className="btn-main w-24"
          type="submit"
          data-testid="form-submission"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
