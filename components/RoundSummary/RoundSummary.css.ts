import { style } from "@vanilla-extract/css";

export const container = style({
  display: "flex",
  flexDirection: "column",
  width: "100vw",
  alignItems: "center",
});

export const title = style({
  marginBottom: 0,
});

export const playlistWrapper = style({
  width: "80vw",
  padding: "1rem",
  borderRadius: "1rem",
});
