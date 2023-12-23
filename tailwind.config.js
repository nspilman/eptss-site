/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        sm: ["14px", "1.25rem"],
        base: ["16px", "1.25rem"],
        lg: ["20px", "1.25rem"],
        xl: ["24px", "1.25rem"],
        "3xl": ["1.875rem", "1.75rem"],
        header: ["36px", "1.25rem"],
      },
      colors: {
        themeYellow: "#fffe53",
        bgGradientLighterBLue: "#05397a",
        bgGradientDarkerBLue: "#1C2026",
        bgTransparent: "hsla(0,0%,100%,.05)",
      },
      boxShadow: {
        NavShadow: " 0px 0px 3px 3px #F6E05E",
      },
      fontFamily: {
        fraunces: ["Fraunces", "serif"],
        roboto: ["Roboto", "serif"],
      },
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(-10px, 0px) scale(1.1)",
          },
          "66%": {
            transform: "translate(10px, 0px) scale(1.1)",
          },
          "100%": {
            transform: "tranlate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
};
