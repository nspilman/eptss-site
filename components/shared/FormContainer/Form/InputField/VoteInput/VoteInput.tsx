import { FormLabel, Stack, Text } from "@chakra-ui/react";
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
    <Stack direction="column" width="100%">
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
              <FormLabel
                htmlFor={field + i}
                fontFamily="'Rock Salt', sans-serif !important"
                fontSize=".75rem"
                color="blackAlpha.800"
              >
                {value}
              </FormLabel>
            </>
          ))}
        </Stack>
      </RadioGroup>
      <Stack direction="row">
        <span className="text-md font-light font-roboto text-black-800 text-center my-4">
          Absolutely not! ---------- yes please!!{" "}
        </span>
      </Stack>
    </Stack>
  );
}
