import { defineStyleConfig } from "@chakra-ui/react";

export const ButtonStyles = defineStyleConfig({
  baseStyle: {
    fontFamily: "Fraunces, sans-serif",
    fontWeight: "bold",
    textTransform: "lowercase",
    borderRadius: "full",
    _hover: {
      bg: "yellow.300",
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
      px: 10,
      py: 4,
    },
  },
  variants: {
    outline: {
      border: "2px solid",
      borderColor: "white",
      color: "white",
      _hover: {
        bg: "transparent",
        borderColor: "yellow.500",
        color: "yellow.500",
      },
    },
    solid: {
      bg: "white",
      _hover: {
        color: "gray.600",
      },
    },
    ghost: {
      color: "white",
      _hover: {
        bg: "rgba(255, 255, 255, 0.1)",
      },
    },
  },
  defaultProps: {
    size: "md",
    variant: "outline",
  },
});
