import { style } from "@vanilla-extract/css";

export const container = style({
  maxWidth: "1200px",
  margin: "auto",
  display: "flex",
  flexDirection: "column",
  "@media": {
    "screen and (max-width: 1200px)": {
      margin: "0 20px",
    },
  },
});

export const cardHeader = style({
  textAlign: "left",
});

export const card = style({
  flexBasis: "100%",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(5px)",
  boxShadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
  transition: "all 0.3s cubic-bezier(.25,.8,.25,1)",
  padding: "20px",
  marginBottom: "30px",
});

export const howItWorks = style({
  display: "flex",
  justifyContent: "space-evenly",
  margin: "auto",
});

export const howItWorksText = style({
  margin: "15px auto",
  fontWeight: "bold",
  textAlign: "center",
});

export const itemThird = style({
  flexBasis: "33%",
  padding: "10px",
  "@media": {
    "screen and (max-width: 600px)": {
      flexBasis: "100%",
    },
  },
});
