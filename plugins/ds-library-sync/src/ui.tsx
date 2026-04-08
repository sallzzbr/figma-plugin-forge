/**
 * ui.tsx — DS Library Sync Plugin Bootstrap
 *
 * Initializes the Preact UI. Uses the standard @create-figma-plugin/build
 * pattern that requires `export default function`.
 */

import { render, h } from 'preact'
import App from './App'

// Global CSS animations
const style = document.createElement('style')
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(style)

/**
 * Entry point for the plugin UI.
 * @create-figma-plugin/build expects `export default function`.
 */
export default function (rootNode: HTMLElement) {
  document.body.classList.remove('figma-dark', 'dark')
  document.body.style.backgroundColor = 'white'
  render(<App />, rootNode)
}
