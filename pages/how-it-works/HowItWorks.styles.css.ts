import { style } from "@vanilla-extract/css";

export const container = style({
  padding: 0,
});

export const body = style({
  padding: "32px",
  marginTop: "32px",
  display: "flex",
  flexWrap: "wrap",
  flexDirection: "column",
  maxWidth: "100vw",
});
