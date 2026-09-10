/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#F4F6FB",        // light background
        panel: "#FFFFFF",       // card surface
        panel2: "#F0F2F8",      // raised surface
        line: "#DFE3EE",        // hairline borders
        mist: "#6B7394",        // muted text
        fog: "#2D3250",         // primary text (dark on light)
        signal: "#0F9E8A",      // AeroVir teal — brand / sensing accent
        signal2: "#0DBFA6",     // brighter teal for hover states
        ember: "#E84D38",       // AeroVir coral — alerts / hazards
        good: "#22C55E",
        moderate: "#EAB308",
        poor: "#F97316",
        severe: "#EF4444",
        hazardous: "#A855F7",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(15,158,138,0.20)",
        emberglow: "0 0 40px -10px rgba(232,77,56,0.20)",
      },
      animation: {
        "pulse-ring": "pulse-ring 3s cubic-bezier(0.2,0.6,0.4,1) infinite",
        "pulse-ring-delay": "pulse-ring 3s cubic-bezier(0.2,0.6,0.4,1) infinite 1s",
        "pulse-ring-delay2": "pulse-ring 3s cubic-bezier(0.2,0.6,0.4,1) infinite 2s",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.4)", opacity: "0.8" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
}
