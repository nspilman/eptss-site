import { style } from "@vanilla-extract/css";
import { colors } from "styles/theme.css";

export const headerCell = style({
  textAlign: "left",
  fontSize: "1.25rem",
  fontWeight: 700,
  padding: ".5rem 0",
  textDecoration: "underline",
  cursor: "pointer",
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
  margin: "1rem",
});

export const defaultColumn = style({
  width: "20%",
});

export const body = style({
  overflow: "auto",
});

export const smallHeight = style({
  height: "18rem",
});

export const mediumHeight = style({
  height: "36rem",
});

export const largeHeight = style({
  height: "48rem",
});

export const smallWidth = style({
  width: "50vw",
});

export const mediumWidth = style({
  width: "70vw",
});

export const largeWidth = style({
  width: "90vw",
});
