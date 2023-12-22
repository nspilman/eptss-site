import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  colors: {
    yellow: {
      300: "#fffe53",
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
});
