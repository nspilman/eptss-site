import { defineStyleConfig } from "@chakra-ui/react";

export const ButtonStyles = defineStyleConfig({
  baseStyle: {
    fontWeight: "bold",
    textTransform: "uppercase",
    borderRadius: "base",
    _hover: {
      bg: "white",
      transition: "100ms",
      color: "blue.900",
    },
  },
  sizes: {
    sm: {
      fontSize: "sm",
      px: 4,
      py: 3,
    },
    md: {
      fontSize: "md",
      px: 6,
      py: 4,
    },
  },
  variants: {
    outline: {
      border: "2px solid",
      borderColor: "white",
      color: "white",
      _hover: {
        textDecoration: "auto",
        boxShadow: "0 0 3px 3px var(--chakra-colors-yellow-300)",
      },
    },
    primary: {
      border: "2px solid",
      borderColor: "yellow.300",
      color: "yellow.300",
      _hover: {
        borderColor: "green.400",
        boxShadow:
          "0 0 1px 1px var(--chakra-colors-green-500), 0 0 2px 2px var(--chakra-colors-green-400), 0 0 3px 3px var(--chakra-colors-green-300)",
      },
    },
  },
  defaultProps: {
    size: "md",
    variant: "outline",
  },
});
