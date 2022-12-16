import { style } from "@vanilla-extract/css";
import { colors } from "styles/theme.css";

export const container = style({
  backgroundColor: colors.darkbluehero,
  margin: "1rem",
  padding: "1rem",
  borderRadius: "1rem",
  display: "flex",
  flexDirection: "column",
});
