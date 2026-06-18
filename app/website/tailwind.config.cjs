/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@remavideo/ui/tailwind-preset")],
  content: [
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
};
