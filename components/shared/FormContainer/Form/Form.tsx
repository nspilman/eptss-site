import { FieldValues, useForm } from "react-hook-form";
import React from "react";
import { InputField } from "./InputField";
import { InputType } from "./types";
import { Box, Center, Heading, Stack } from "@chakra-ui/react";

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
    <Stack alignItems="center" justifyContent="center">
      <Heading as="h1" size="md" textAlign="center" py="8">
        {title}
      </Heading>
      <Box>{description}</Box>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack direction="column" alignItems="center">
          <Center flexWrap="wrap">
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
          </Center>
          <button
            className="btn-main"
            type="submit"
            data-testid="form-submission"
          >
            Submit
          </button>
        </Stack>
      </form>
    </Stack>
  );
}
