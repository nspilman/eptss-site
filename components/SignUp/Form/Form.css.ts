import { style } from "@vanilla-extract/css";
import { colors, titleFont } from "../../../styles/theme.css";

export const form = style({
  alignItems: "center",
  backgroundColor: colors.darkbluehero,
  display: "flex",
  borderRadius: "20px",
  boxSizing: "border-box",
  padding: "20px",
  flexDirection: "column",
});

export const formFieldWrapper = style({
  flexDirection: "row",
  flexWrap: "wrap",
  maxWidth: "700px",
  display: "flex",
  justifyContent: "center",
});

export const title = style({
  fontFamily: titleFont,
  fontSize: "1.25rem",
});

export const descriptionWrapper = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  paddingBottom: "1rem",
  marginBlockStart: 0,
});
