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
  },
  styles: {
    global: {
      body: {
        background:
          "linear-gradient(var(--chakra-colors-gradient-darkBlueHero), var(--chakra-colors-gradient-graybluehero)), url('https://images.unsplash.com/photo-1458560871784-56d23406c091?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80') fixed",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        color: "white",
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
