import { style } from "@vanilla-extract/css";
import {
  colors,
  roundedCorners,
  tabletBreakpoint,
  titleFont,
} from "styles/theme.css";

export const container = style({
  backgroundColor: colors.lightgray,
  display: "flex",
  flexDirection: "column",
  borderRadius: "1rem",
  padding: "1rem",
  margin: ".5rem",
  flexBasis: "auto",
  boxSizing: "border-box",
});

export const small = style({
  flexGrow: 1,
  minWidth: "250px",
});

export const large = style({
  flex: "0 0 98%",
  minWidth: "275px",
});

export const labelWrapper = style({
  display: "flex",
  justifyContent: "space-between",
});

export const linkWrapper = style([
  {
    height: "2rem",
    backgroundColor: colors.darkblue,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: ".25rem 1rem",
    borderRadius: ".25rem",
    fontSize: ".75rem",
  },
]);
export const required = {
  "::before": {
    content: " *",
    color: "red",
    fontSize: ".5rem",
    paddingRight: ".25rem",
  },
};

export const label = style([
  {
    paddingBottom: ".25rem",
    color: colors.grayblue,
    fontFamily: titleFont,
    fontSize: ".75rem",
    "@media": {
      [tabletBreakpoint]: {
        fontSize: ".5rem",
      },
    },
  },
]);

export const requiredLabel = style([required, label]);

export const errorMessage = style([
  required,
  {
    fontSize: ".75rem",
    color: colors.grayblue,
  },
]);

export const errorContainer = style({
  height: "1rem",
});
