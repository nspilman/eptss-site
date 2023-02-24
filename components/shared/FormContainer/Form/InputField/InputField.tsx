import { Box, FormLabel, Link, Text } from "@chakra-ui/react";
import { FieldValues, UseFormRegister } from "react-hook-form";
import { InputType } from "../types";
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
    <Box
      width={size === "small" ? "400px" : "700px"}
      data-testid={getFieldTestId(field.field, type)}
    >
      <Box>
        <FormLabel>{`${label}`}</FormLabel>
        {hasLink && (
          <Box>
            <Link target="_blank" rel="noopener noreferrer" href={field.link}>
              listen
            </Link>
          </Box>
        )}
      </Box>
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
      <Box>
        {errors[fieldId] && (
          <Text data-testid={getFieldErrorId(fieldId)}>
            This field is required
          </Text>
        )}
      </Box>
    </Box>
  );
}
