const { heroui } = require("@heroui/react");

/**
 * "On Air" palette — warm paper/ink editorial light theme and a
 * video-black dark theme, both keyed to a vermilion tally-light accent.
 * Shared Tailwind preset for every app using the rema brand.
 */
const vermilion = {
  50: "#fff3ec",
  100: "#ffe3d3",
  200: "#ffc5a8",
  300: "#ff9f73",
  400: "#ff7a42",
  500: "#f25b1e",
  600: "#d84512",
  700: "#b0370f",
  800: "#8c2e12",
  900: "#712611",
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Bricolage Grotesque Variable",
          "Bricolage Grotesque",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "Bricolage Grotesque Variable",
          "Bricolage Grotesque",
          "system-ui",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        brand: vermilion,
        // Always-dark "video frame" surfaces (caption bars, code, monitors)
        screen: {
          DEFAULT: "#0c0b09",
          raised: "#161310",
          line: "#2a251e",
        },
      },
      maxWidth: {
        "6xl": "72rem",
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      defaultTheme: "light",
      layout: {
        radius: {
          small: "6px",
          medium: "10px",
          large: "16px",
        },
      },
      themes: {
        light: {
          colors: {
            background: "#faf6ee",
            foreground: "#1c1814",
            divider: "rgba(28, 24, 20, 0.12)",
            overlay: "#f2ecdf",
            focus: "#d84512",
            content1: "#f3eee3",
            content2: "#eae3d2",
            content3: "#ddd3bf",
            content4: "#c9bda4",
            default: {
              50: "#f7f2e7",
              100: "#efe8d8",
              200: "#e2d8c1",
              300: "#c9bda4",
              400: "#9b8e77",
              500: "#766b58",
              600: "#5a5044",
              700: "#443c33",
              800: "#2e2922",
              900: "#1c1814",
              DEFAULT: "#e2d8c1",
              foreground: "#1c1814",
            },
            primary: {
              ...vermilion,
              DEFAULT: "#d84512",
              foreground: "#fff7f1",
            },
            secondary: {
              DEFAULT: "#0e6e60",
              foreground: "#f0fbf8",
            },
            success: { DEFAULT: "#287d3c", foreground: "#f1faf2" },
            warning: { DEFAULT: "#b07708", foreground: "#1c1814" },
            danger: { DEFAULT: "#c03221", foreground: "#fdf3f1" },
          },
        },
        dark: {
          colors: {
            background: "#100e0b",
            foreground: "#f3eee3",
            divider: "rgba(243, 238, 227, 0.1)",
            overlay: "#1a1712",
            focus: "#ff7a42",
            content1: "#191613",
            content2: "#23201a",
            content3: "#2f2a22",
            content4: "#3e372c",
            default: {
              50: "#191613",
              100: "#23201a",
              200: "#2f2a22",
              300: "#3e372c",
              400: "#857a66",
              500: "#a2967f",
              600: "#bfb49c",
              700: "#d6ccb8",
              800: "#e8e0d0",
              900: "#f3eee3",
              DEFAULT: "#2f2a22",
              foreground: "#f3eee3",
            },
            primary: {
              ...vermilion,
              DEFAULT: "#ff7a42",
              foreground: "#1c0d04",
            },
            secondary: {
              DEFAULT: "#3ecfb2",
              foreground: "#062019",
            },
            success: { DEFAULT: "#4ade80", foreground: "#052012" },
            warning: { DEFAULT: "#fbbf24", foreground: "#201605" },
            danger: { DEFAULT: "#f87171", foreground: "#250808" },
          },
        },
      },
    }),
  ],
};
