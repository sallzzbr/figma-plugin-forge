import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    // backend/ is Deno code with its own toolchain — lint it with Deno, not here.
    ignores: ['build/**', 'coverage/**', 'node_modules/**', 'backend/**', 'build.mjs', 'eslint.config.mjs'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, figma: 'readonly', __html__: 'readonly' },
    },
  },
  {
    files: ['src/**/*.test.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  prettier,
)
