import { style } from "@vanilla-extract/css";
import { mobileBreakpoint, tabletBreakpoint } from "styles/theme.css";

export const container = style({
  padding: "1rem 6rem",
  "@media": {
    [tabletBreakpoint]: {
      padding: "1rem 3rem",
    },
    [mobileBreakpoint]: {
      padding: "1rem",
    },
  },
});
