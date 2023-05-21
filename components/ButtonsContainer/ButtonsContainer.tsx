import { Stack } from "@chakra-ui/react";

export const ButtonsContainer = ({
  children,
}: {
  children: React.ReactElement[];
}) => {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      justifyContent="center"
      alignItems="center"
    >
      {children}
    </Stack>
  );
};
