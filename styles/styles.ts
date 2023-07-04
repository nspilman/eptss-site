import { extendTheme } from "@chakra-ui/react";
import { ButtonStyles as Button } from "./Button";
import { HeadingStyles as Heading } from "./Heading";
import { LinkStyles as Link } from "./Link";
import { TextStyles as Text } from "./Text";

export const theme = extendTheme({
  colors: {
    yellow: {
      100: "#FFFF87",
      300: "#fffe53",
      500: "#C9CB10",
    },
    blue: {
      900: "#1C2026",
    },
    gradient: {
      darkBlueHero: "rgba(10, 10, 80, 0.7)",
      graybluehero: "rgba(10, 50, 120, 0.7)",
    },
    bgTransparent: "hsla(0,0%,100%,.05)",
  },
  styles: {
    global: {
      body: {
        backgroundColor: "blue.800",
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
