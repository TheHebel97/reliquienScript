const webpack = require('webpack');
const base = require('./webpack.config');
const { version } = require('./package.json');

module.exports = {
  ...base,
  mode: 'production',
  devtool: false,
  optimization: { minimize: false },
  output: { ...base.output, filename: 'reliquiensrtipz.user.js' },
  plugins: [new webpack.BannerPlugin({
    raw: true,
    entryOnly: true,
    banner: `// ==UserScript==
// @name         Reliquiensrtipz
// @namespace    reliquiensrtipz
// @version      ${version}
// @description  Reliquien-Inventar mit Filtern, Sortierung, eigenen Highlight-Presets, Shiny-Markierung und verschiebbaren Randfenstern.
// @match        https://*.die-staemme.de/game.php?village=*&screen=relic_*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==`
  })]
};
