/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        alien: "url('/alien.jpg')", // Make sure alien.jpg is in /public
      },
      colors: {
        alienGreen: "#00ff99",
        alienPurple: "#8e44ad",
      },
      fontFamily: {
        techno: ["Orbitron", "sans-serif"],
      },
    },
  },
  plugins: [],
};
