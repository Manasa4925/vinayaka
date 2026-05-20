/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0b0f17",         // Deep slate black
        glassBg: "rgba(15, 23, 42, 0.65)", // Glass container background
        glassBorder: "rgba(255, 255, 255, 0.07)",
        brandPurple: "#8b5cf6",
        brandIndigo: "#6366f1",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        glowPurple: "0 0 20px rgba(139, 92, 246, 0.25)",
        glowIndigo: "0 0 20px rgba(99, 102, 241, 0.25)",
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      backdropBlur: {
        glass: "12px",
      }
    },
  },
  plugins: [],
}
