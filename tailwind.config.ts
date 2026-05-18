import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Base oscura profunda
        ink: {
          950: "#010308",
          900: "#03060d",
          800: "#060a14",
          700: "#0a1020",
          600: "#0f1830",
          500: "#162241",
        },
        // Cyan system
        cyan: {
          glow: "#22e6ff",
          soft: "#7df3ff",
          dim: "#0e7490",
        },
        // Electric blue
        electric: {
          DEFAULT: "#3b82f6",
          bright: "#60a5fa",
          deep: "#1d4ed8",
          dim: "#1e3a5f",
        },
        // Señales de estado
        signal: {
          green: "#22d3a5",
          "green-dim": "#064e3b",
          amber: "#fbbf24",
          "amber-dim": "#451a03",
          red: "#f43f5e",
          "red-dim": "#4c0519",
        },
        // Estados operativos
        state: {
          locked: "#22e6ff",    // LOCKED IN
          focused: "#22d3a5",   // FOCUSED
          operational: "#7df3ff", // OPERATIONAL
          unstable: "#fbbf24",  // UNSTABLE
          reactive: "#f43f5e",  // REACTIVE
        },
        // Actividades del horario
        activity: {
          gym: "#22d3a5",
          work: "#7c93b8",
          classes: "#fbbf24",
          projects: "#a78bfa",
          commercial: "#2dd4bf",
          rest: "#64748b",
          review: "#22e6ff",
          sleep: "#334155",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(34,230,255,0.20)",
        "glow-sm": "0 0 10px rgba(34,230,255,0.15)",
        "glow-strong": "0 0 40px rgba(34,230,255,0.35)",
        "glow-green": "0 0 20px rgba(34,211,165,0.20)",
        "glow-amber": "0 0 20px rgba(251,191,36,0.20)",
        "glow-red": "0 0 20px rgba(244,63,94,0.20)",
        card: "0 4px 24px rgba(0,0,0,0.40), 0 1px 0 rgba(255,255,255,0.03)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.50), 0 1px 0 rgba(255,255,255,0.05)",
        inner: "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      backgroundImage: {
        "grid-subtle":
          "linear-gradient(rgba(34,230,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,230,255,0.04) 1px, transparent 1px)",
        "radial-blue":
          "radial-gradient(ellipse 80% 50% at 70% -10%, rgba(59,130,246,0.12), transparent)",
        "radial-cyan":
          "radial-gradient(ellipse 60% 40% at 0% 100%, rgba(34,230,255,0.08), transparent)",
        "locked-glow":
          "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(34,230,255,0.06), transparent)",
        "reactive-glow":
          "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(244,63,94,0.06), transparent)",
        "unstable-glow":
          "radial-gradient(ellipse 100% 60% at 50% 0%, rgba(251,191,36,0.05), transparent)",
      },
      animation: {
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "scan": "scan 8s linear infinite",
        "fade-up": "fadeUp 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
        "breathe": "breathe 4s ease-in-out infinite",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        pulseDot: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.4)", opacity: "0.7" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(200%)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-8px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
