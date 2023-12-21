import {
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/react";
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
    <Flex
      bg="gray.50"
      my="2"
      mx="1"
      p="4"
      borderRadius="2xl"
      flexGrow="1"
      minWidth={
        isSmall
          ? { base: "100px", sm: "250px" }
          : { base: "100px", sm: "400px" }
      }
      data-testid={getFieldTestId(field.field, type)}
      direction="column"
    >
      <FormControl isRequired={!field.optional}>
        <div>
          <FormLabel
            color="blackAlpha.700"
            fontWeight="500"
            fontSize="1.5rem"
            pb="2"
          >{`${label}`}</FormLabel>
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
            <FormErrorMessage data-testid={getFieldErrorId(fieldId)}>
              This field is required
            </FormErrorMessage>
          ) : (
            <FormHelperText>
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
            </FormHelperText>
          )}
        </div>
      </FormControl>
    </Flex>
  );
}
