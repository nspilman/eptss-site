import { style } from "@vanilla-extract/css";
import { colors, titleFont } from "../../../../../../styles/theme.css";

export const voteOptions = style({
  display: "flex",
  flexDirection: "row",
  color: colors.darkblue,
  alignItems: "center",
});

export const numberLabel = style({
  fontFamily: titleFont,
  fontSize: ".75rem",
});

export const option = style({
  padding: "0 .25rem",
});

export const optionsLegend = style({
  fontSize: ".5rem",
});
