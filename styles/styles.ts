import { extendTheme } from "@chakra-ui/react";
import { ButtonStyles as Button } from "./Button";
import { HeadingStyles as Heading } from "./Heading";
import { LinkStyles as Link } from "./Link";
import { TextStyles as Text } from "./Text";

export const theme = extendTheme({
  colors: {
    yellow: {
      100: "#F3E8D2",
      300: "#F8D38D",
      500: "#F0BF61",
      800: "#9F772A",
    },
    blue: {
      500: "#2586AF",
      900: "#1C2026",
    },
    gradient: {
      darkBlueHero: "rgba(10, 10, 80, 0.7)",
      graybluehero: "rgba(10, 50, 120, 0.7)",
    },
    bgTransparent: "hsla(0,0%,100%,.05)",
    darkGrayHero: "#363B3E",
  },
  styles: {
    global: {
      body: {
        background: "var(--chakra-colors-darkGrayHero)",
      },
    },
  },
  components: {
    Button,
    Link,
    Text,
    Heading,
  },
});
