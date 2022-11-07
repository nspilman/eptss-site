import { style } from "@vanilla-extract/css";
import {
  mobileBreakpoint,
  tabletBreakpoint,
  titleFont,
} from "../../../styles/theme.css";

export const header = style({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "fixed",
  width: "100%",
  zIndex: 1,
  backgroundColor: "rgb(0, 100,100,.1)",
  borderRadius: "10px",
  "@media": {
    [mobileBreakpoint]: {
      justifyContent: "center",
    },
  },
});

export const titleText = style({
  fontFamily: titleFont,
  padding: "0 20px",
  cursor: "pointer",
});

export const navButtons = style({
  padding: "0 20px",
  "@media": {
    [mobileBreakpoint]: {
      display: "none",
    },
  },
});

export const removeAtTabletWidth = style({
  "@media": {
    [tabletBreakpoint]: {
      display: "none",
    },
  },
});
