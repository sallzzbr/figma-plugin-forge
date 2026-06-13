/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      fontSize: {
        'figma-xs': '11px',
        'figma-sm': '12px',
        'figma-base': '13px',
      },
      colors: {
        'figma-bg': '#2c2c2c',
        'figma-bg-hover': '#3c3c3c',
        'figma-text': '#e5e5e5',
        'figma-text-secondary': '#b3b3b3',
        'figma-border': '#444444',
        'figma-blue': '#0d99ff',
      },
    },
  },
  plugins: [],
}
