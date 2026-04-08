import base from '../../packages/shared/tailwind.config.base.js'

/** @type {import('tailwindcss').Config} */
export default {
  ...base,
  content: [
    ...base.content,
    './src/**/*.{ts,tsx,js,jsx,html}',
  ],
}
