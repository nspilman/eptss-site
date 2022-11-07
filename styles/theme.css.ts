import { style } from "@vanilla-extract/css";

export const mobileBreakpointPixels = 600;
export const tabletBreakpointPixels = 1024;

export const centered = style({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
});

export const mobileBreakpoint = `screen and (max-width: ${mobileBreakpointPixels}px)`;
export const tabletBreakpoint = `screen and (max-width: ${tabletBreakpointPixels}px)`;

export const titleFont = "'Rock Salt', sans-serif";
