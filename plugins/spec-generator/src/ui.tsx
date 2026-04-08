/**
 * ui.tsx -- Spec Generator
 * ----------------------------------------------------------------
 * UI bootstrap for the plugin.
 *
 * @create-figma-plugin/build expects `export default function(rootNode)`
 * as the UI entry point. This file injects global animations,
 * forces white background (cancels Figma dark theme), and mounts the Preact app.
 */

import { render, h } from 'preact'
import App from './App'

// Global CSS animations used by LoadingSpinner and other components
const style = document.createElement('style')
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
`
document.head.appendChild(style)

/**
 * Entry point called by the @create-figma-plugin/build bootstrap.
 * @param rootNode - DOM element where the Preact app will be mounted
 */
export default function (rootNode: HTMLElement) {
  document.body.classList.remove('figma-dark', 'dark')
  document.body.style.backgroundColor = 'white'
  render(<App />, rootNode)
}
