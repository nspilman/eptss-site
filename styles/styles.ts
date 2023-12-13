import { extendTheme } from "@chakra-ui/react";
import { HeadingStyles as Heading } from "./Heading";
import { LinkStyles as Link } from "./Link";

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
    bgTransparent: "hsla(0,0%,100%,.05)",
  },
  styles: {
    global: {
      body: {
        backgroundColor: "black",
      },
    },
  },
  components: {
    Link,
    Heading,
  },
});
