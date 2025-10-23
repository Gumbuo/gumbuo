/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      zIndex: {
        "-1": "-1"
      },
      backgroundImage: {
        alien: "url('/alien.jpg')"
      },
      colors: {
        alienGreen: "#00ff99",
        alienPurple: "#8e44ad"
      },
      fontFamily: {
        techno: ["Orbitron", "sans-serif"]
      }
    }
  },
  experimental: {
    appDir: true
  },
  plugins: []
};
