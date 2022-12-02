import { style, globalStyle } from "@vanilla-extract/css";

export const mobileBreakpointPixels = 640;
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

export const colors = {
  yellow: "#fffe53",
  yellowLight: "#FFFF87",
  yellowDark: "#C9CB10",
  darkblue: "#1C2026",
  grayblue: "#43474E",
  lightgray: "#ccc",
  darkbluehero: "rgba(28, 32, 38, 0.9)",
  graybluehero: "rgba(183, 192, 209, 0.9)",
};

globalStyle("body", {
  height: "100%",
  width: "100%",
  margin: 0,
  background:
    "linear-gradient(var(--darkbluehero), var(--darkbluehero)), url('https://images.unsplash.com/photo-1458560871784-56d23406c091?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80') center center / cover no-repeat",
  backgroundAttachment: "fixed",
  color: "white",
  fontSize: "1rem",
  fontFamily: "'Roboto', sans-serif",
  fontWeight: 400,
  overflowX: "hidden",
  display: "flex",
  flexDirection: "column",
  scrollBehavior: "smooth",
});

globalStyle("a", {
  color: colors.yellow,
});

globalStyle("h1", {
  fontFamily: titleFont,
  fontSize: "48px",
  fontWeight: 300,
  "@media": {
    [tabletBreakpoint]: {
      fontSize: "36px",
    },
    [mobileBreakpoint]: {
      fontSize: "24px",
    },
  },
});
