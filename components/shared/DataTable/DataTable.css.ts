import { style } from "@vanilla-extract/css";
import { colors } from "styles/theme.css";

export const headerCell = style({
  textAlign: "left",
  fontSize: "1.25rem",
  fontWeight: 700,
  padding: ".5rem 0",
  textDecoration: "underline",
});

export const row = style({
  selectors: {
    "&:nth-child(2n)": {
      background: colors.darkbluehero,
    },
  },
});

export const table = style({
  display: "flex",
  flexDirection: "column",
});

export const defaultColumn = style({
  width: "20vw",
});
