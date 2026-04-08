import { render, h } from 'preact'
import App from './App'

const style = document.createElement('style')
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`
document.head.appendChild(style)

export default function (rootNode: HTMLElement) {
  document.body.classList.remove('figma-dark', 'dark')
  document.body.style.backgroundColor = 'white'
  render(<App />, rootNode)
}
