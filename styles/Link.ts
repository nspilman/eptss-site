import { defineStyleConfig } from "@chakra-ui/react";

export const LinkStyles = defineStyleConfig({
  baseStyle: {
    _hover: {
      textDecoration: "none",
    },
  },
  sizes: {},
  variants: {
    button: {},
    primary: {
      _hover: {
        color: "var(--chakra-colors-yellow-300)",
      },
    },
  },
  // The default size and variant values
  defaultProps: {
    variant: "primary",
  },
});
