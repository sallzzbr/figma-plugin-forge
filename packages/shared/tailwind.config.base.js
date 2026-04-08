/**
 * Tailwind CSS base config for Figma Plugin Forge.
 *
 * Plugins extend this config adding their own content paths:
 *
 *   import base from '../../packages/shared/tailwind.config.base.js'
 *   export default {
 *     ...base,
 *     content: [...base.content, './src/**\/*.{ts,tsx,js,jsx,html}'],
 *   }
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    '../../packages/shared/**/*.{ts,tsx}',
  ],
  safelist: [
    'bg-indigo-500',
    'bg-indigo-600',
    'text-indigo-500',
    'text-white',
    'hover:bg-indigo-600',
    'bg-indigo-50',
    'text-gray-500',
    'text-black',
    'border-indigo-500',
    'border-gray-300',
    'rounded-t-md',
    'text-sm',
    'font-medium',
    'shadow',
    'hover:text-black',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--figma-color-bg)',
        'bg-2': 'var(--figma-color-bg-secondary)',
        text: 'var(--figma-color-text)',
        brand: 'var(--figma-color-bg-brand)',
        'on-brand': 'var(--figma-color-text-onbrand)',
        border: 'var(--figma-color-border)',
        success: 'var(--figma-color-text-success)',
        danger: 'var(--figma-color-text-danger)',
        warning: 'var(--figma-color-text-warning)',
      },
      fontFamily: {
        ui: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: false,
}
