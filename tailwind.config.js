/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        NavShadow: " 0px 0px 3px 3px rgba(	246,	224,	94, .8)",
      },
    },
  },
  plugins: [],
};
