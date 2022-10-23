import { style } from "@vanilla-extract/css";

export const buttonPrimary = style({
  margin: "5px",
  padding: "20px 40px",
  width: "170px",
  backgroundColor: "white",
  color: "var(--darkblue)",
  border: "1px solid white",
  fontFamily: "'IBM Plex Sans', sans-serif",
  fontSize: ".85rem",
  fontWeight: 500,
  textTransform: "uppercase",
  cursor: "pointer",
  transition: " all 0.4s ease",
  ":hover": {
    color: "yellow",
  },
});
