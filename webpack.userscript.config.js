const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const base = require('./webpack.config');
const { version } = require('./package.json');

module.exports = {
  ...base,
  mode: 'production',
  devtool: false,
  optimization: { minimize: false },
  // Tracked submission artifact; never clean the repository output directory.
  output: { ...base.output, path: __dirname, filename: 'reliquiensrtipz.user.js', clean: false },
  plugins: [new webpack.BannerPlugin({
    raw: true,
    entryOnly: true,
    banner: `// ==UserScript==
// @name         Reliquien-Inventarhelfer
// @namespace    https://github.com/TheHebel97/reliquienScript
// @version      ${version}
// @author       TheHebel97
// @license      MIT
// @homepageURL  https://github.com/TheHebel97/reliquienScript
// @description  Reliquien-Inventar mit Filtern, Sortierung, eigenen Highlight-Presets, Shiny-Markierung und verschiebbaren Randfenstern.
// @match        https://*.die-staemme.de/game.php?village=*&screen=relic_*
// @run-at       document-idle
// @grant        none
// @noframes
// ==/UserScript==

/*
${fs.readFileSync(path.join(__dirname, 'LICENSE'), 'utf8').trim()}
*/`
  })]
};
