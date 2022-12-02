import { style } from "@vanilla-extract/css";
import { titleFont } from "styles/theme.css";

export const container = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
});

export const searchBox = style({
  border: "none",
  borderRadius: ".5rem",
  padding: ".5rem",
  marginBottom: "1rem",
  minWidth: "30vw",
});

export const defaultColumn = style({
  width: "10vw",
});
