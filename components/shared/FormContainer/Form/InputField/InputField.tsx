import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Link,
} from "@chakra-ui/react";
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
  const isSmall = size === "small";
  return (
    <Flex
      bg="gray.50"
      my="2"
      mx="1"
      p="4"
      borderRadius="2xl"
      flexGrow="1"
      minWidth={isSmall ? "250px" : "350px"}
      data-testid={getFieldTestId(field.field, type)}
      direction="column"
    >
      <FormControl isRequired={!field.optional}>
        <Box>
          <FormLabel
            fontFamily="'Rock Salt', sans-serif !important"
            color="blackAlpha.700"
            fontWeight="300"
            fontSize="1rem"
            pb="2"
          >{`${label}`}</FormLabel>
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
          {errors[fieldId] ? (
            <FormErrorMessage data-testid={getFieldErrorId(fieldId)}>
              This field is required
            </FormErrorMessage>
          ) : (
            <FormHelperText>
              {hasLink && (
                <Link
                  pt="4"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={field.link}
                  fontWeight="500"
                  color="orange.600"
                  shadow="2xl"
                >
                  Listen Here
                </Link>
              )}
            </FormHelperText>
          )}
        </Box>
      </FormControl>
    </Flex>
  );
}
