import { FieldValues, useForm } from "react-hook-form";
import React from "react";
import { InputField } from "./InputField";
import { InputType } from "./types";
import { Box, Button, Container, FormControl, Heading } from "@chakra-ui/react";

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
    <Container>
      <Heading>{title}</Heading>
      <Box>{description}</Box>
      <FormControl onSubmit={handleSubmit(onSubmit)}>
        {/* TODO - this should be outside the form */}
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
        <Button type="submit" data-testid="form-submission">
          Submit
        </Button>
      </FormControl>
    </Container>
  );
}
