/* HERO STYLES */

import { style } from "@vanilla-extract/css";
import { mobileBreakpoint, titleFont } from "../../../styles/theme.css";

export const title = style({
  fontFamily: titleFont,
  fontSize: "48px",
  fontWeight: 300,
  "@media": {
    [mobileBreakpoint]: {
      fontSize: "24px",
    },
  },
});

export const hero = style({
  alignItems: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  textAlign: "center",
  height: "100vh",
  width: "100%",
  backgroundAttachment: "fixed",
  margin: 0,
});

export const container = style({
  width: "50%",
  maxWidth: "1200px",
  marginBottom: "30px",
});

export const text = style({
  margin: "auto",
  paddingBottom: "32px",
});
