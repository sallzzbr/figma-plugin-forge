/**
 * scripts/build-html.js
 * ----------------------------------------------------------------
 * Generates the final ui.html with embedded CSS and JS.
 *
 * Post-build step: reads build/ui.js and src/output.css, combines
 * them into a single HTML file that Figma loads as the plugin UI.
 *
 * Declares __FIGMA_COMMAND__ and __SHOW_UI_DATA__ before the plugin JS
 * (required by @create-figma-plugin/build).
 *
 * USAGE: Called from the plugin root directory.
 *   node ../../packages/shared/scripts/build-html.js
 *   or
 *   node scripts/build-html.js (if copied locally)
 */
const fs = require('fs');
const path = require('path');

// Resolve paths relative to CWD (the plugin root that invoked this script)
const pluginRoot = process.cwd();
const jsPath = path.join(pluginRoot, 'build', 'ui.js');
const cssPath = path.join(pluginRoot, 'src', 'output.css');
const htmlPath = path.join(pluginRoot, 'build', 'ui.html');

const js = fs.readFileSync(jsPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
${css}
  </style>
</head>
<body>
  <div id="create-figma-plugin"></div>
  <script>
    var __FIGMA_COMMAND__ = '';
    var __SHOW_UI_DATA__ = {};
  </script>
  <script>
${js}
  </script>
</body>
</html>`;

fs.writeFileSync(htmlPath, html);
console.log('Generated build/ui.html with CSS');
