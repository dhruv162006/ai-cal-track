/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#FF4B4B",
        background: "#0A0A0A",
        card: "#1A1A1A",
        border: "#2A2A2A",
        text: "#FFFFFF",
        textMuted: "#A0A0A0"
      }
    },
  },
  plugins: [],
}
