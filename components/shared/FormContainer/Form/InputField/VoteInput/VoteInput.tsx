import { Box, FormLabel, Input, Stack, Text } from "@chakra-ui/react";
import { Radio, RadioGroup } from "@chakra-ui/react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

interface Props<T extends FieldValues> {
  register: UseFormRegister<T>;
  field: Path<T>;
  optional?: boolean;
}

export function VoteInput<T extends FieldValues>({
  register,
  field,
  optional,
}: Props<T>) {
  return (
    <Stack direction="row" width="100%">
      <Text size="sm" fontWeight="100">
        {" "}
        Absolutely not!{" "}
      </Text>
      <RadioGroup>
        <Stack direction="row">
          {["1", "2", "3", "4", "5"].map((value, i) => (
            <>
              <Radio
                key={i}
                {...register(field, { required: !optional })}
                type="radio"
                value={value}
                id={field + i}
              />
              <FormLabel htmlFor={field + i}>{value}</FormLabel>
            </>
          ))}
        </Stack>
      </RadioGroup>
      <Text> yes please!! </Text>
    </Stack>
  );
}
