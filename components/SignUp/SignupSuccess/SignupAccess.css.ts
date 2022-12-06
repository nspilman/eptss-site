import { style } from "@vanilla-extract/css";
import { colors } from "../../../styles/theme.css";

export const body = style({
  backgroundColor: colors.darkbluehero,
  padding: "1rem 4rem",
  borderRadius: "2rem",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});
