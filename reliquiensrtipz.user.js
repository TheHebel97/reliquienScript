// ==UserScript==
// @name         reliquienUI
// @namespace    https://github.com/TheHebel97/reliquienScript
// @version      1.0.3
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
MIT License

Copyright (c) 2026 TheHebel97

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 868:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.installDiscoveredByToggle = void 0;
var STYLE_ID = 'reliquiensrtipz-discovered-by-toggle-style';
var TOGGLE_ID = 'reliquiensrtipz-discovered-by-toggle';
var STORAGE_KEY = 'reliquiensrtipz:show-discovered-by';
var HIDDEN_CLASS = 'reliquiensrtipz-hide-discovered-by';
function installDiscoveredByToggle() {
    if (document.getElementById(TOGGLE_ID))
        return;
    var nav = Array.from(document.querySelectorAll('table.vis'))
        .find(function (table) { return Boolean(table.querySelector('a[href*="screen=relic_system"][href*="mode=inventory"]')); });
    var row = nav === null || nav === void 0 ? void 0 : nav.querySelector('tr');
    if (!nav || !row)
        return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = "\n    html.".concat(HIDDEN_CLASS, " .discovered_by { display: none !important; }\n    table.reliquiensrtipz-relic-nav { width: 100%; }\n    td.reliquiensrtipz-discovered-by-cell { width: 100%; text-align: right; white-space: nowrap; }\n    #").concat(TOGGLE_ID, " {\n      display: inline-block;\n      padding: 2px 6px;\n      border: 1px solid #a78c61;\n      border-radius: 8px;\n      background: #f1e3c3;\n      color: #6e593b;\n      font: 11px Verdana, sans-serif;\n      cursor: pointer;\n      user-select: none;\n    }\n    #").concat(TOGGLE_ID, "[aria-pressed=\"false\"] { opacity: .65; }\n    #").concat(TOGGLE_ID, ":focus-visible { outline: 2px solid #79552d; outline-offset: 1px; }\n  ");
    document.head.appendChild(style);
    nav.classList.add('reliquiensrtipz-relic-nav');
    var visible = true;
    try {
        visible = localStorage.getItem(STORAGE_KEY) !== 'false';
    }
    catch ( /* Default is visible. */_a) { /* Default is visible. */ }
    var cell = document.createElement('td');
    cell.className = 'center reliquiensrtipz-discovered-by-cell';
    var toggle = document.createElement('span');
    toggle.id = TOGGLE_ID;
    toggle.setAttribute('role', 'button');
    toggle.tabIndex = 0;
    cell.appendChild(toggle);
    row.appendChild(cell);
    var render = function () {
        document.documentElement.classList.toggle(HIDDEN_CLASS, !visible);
        toggle.setAttribute('aria-pressed', String(visible));
        toggle.textContent = visible ? 'Entdeckt von: an' : 'Entdeckt von: aus';
    };
    var change = function () {
        visible = !visible;
        try {
            localStorage.setItem(STORAGE_KEY, String(visible));
        }
        catch ( /* UI remains usable without storage. */_a) { /* UI remains usable without storage. */ }
        render();
    };
    toggle.addEventListener('click', change);
    toggle.addEventListener('keydown', function (event) {
        if (event.key !== 'Enter' && event.key !== ' ')
            return;
        event.preventDefault();
        change();
    });
    render();
}
exports.installDiscoveredByToggle = installDiscoveredByToggle;


/***/ }),

/***/ 595:
/***/ (function(__unused_webpack_module, exports) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.arrangeDock = exports.dockHeightLimits = exports.balanceDockSides = exports.DOCK_GAP = exports.DOCK_MARGIN = void 0;
exports.DOCK_MARGIN = 0;
exports.DOCK_GAP = 8;
// Keep the incoming/dragged panel at its chosen edge and move as few other panels
// as possible. The small number of registered windows keeps this search bounded.
function balanceDockSides(items, availableHeight, preferredIndex) {
    if (preferredIndex === void 0) { preferredIndex = -1; }
    var capacity = Math.max(0, availableHeight);
    var score = function (sides) {
        var height = function (side) {
            var group = items.filter(function (_, i) { return sides[i] === side; });
            return group.reduce(function (sum, item) { return sum + item.height; }, 0) + Math.max(0, group.length - 1) * exports.DOCK_GAP;
        };
        var moves = 0;
        var movedHeight = 0;
        sides.forEach(function (side, i) { if (side !== items[i].side) {
            moves++;
            movedHeight += items[i].height;
        } });
        return [Math.max(0, height('left') - capacity) + Math.max(0, height('right') - capacity), moves, movedHeight];
    };
    var best = items.map(function (item) { return item.side; });
    var bestScore = score(best);
    if (!bestScore[0])
        return best;
    var candidate = [];
    var search = function (index) {
        if (index === items.length) {
            var candidateScore = score(candidate);
            var firstDifference = candidateScore.findIndex(function (value, i) { return value !== bestScore[i]; });
            if (firstDifference >= 0 && candidateScore[firstDifference] < bestScore[firstDifference]) {
                best = candidate.slice();
                bestScore = candidateScore;
            }
            return;
        }
        candidate[index] = items[index].side;
        search(index + 1);
        if (index !== preferredIndex) {
            candidate[index] = items[index].side === 'left' ? 'right' : 'left';
            search(index + 1);
        }
    };
    search(0);
    return best;
}
exports.balanceDockSides = balanceDockSides;
// Small panels keep their natural height; larger panels share only the remaining space.
function dockHeightLimits(heights, availableHeight) {
    var ordered = heights.map(function (height, index) { return ({ height: Math.max(0, height), index: index }); }).sort(function (a, b) { return a.height - b.height; });
    var limits = [];
    var remaining = Math.max(0, availableHeight);
    ordered.forEach(function (item, i) {
        var limit = Math.min(item.height, remaining / (ordered.length - i));
        limits[item.index] = limit;
        remaining -= limit;
    });
    return limits;
}
exports.dockHeightLimits = dockHeightLimits;
// Heights must fit below the fixed game header; the controller caps them before layout.
function arrangeDock(items, viewportHeight, topInset, bottomInset) {
    if (topInset === void 0) { topInset = 0; }
    if (bottomInset === void 0) { bottomInset = 0; }
    var ordered = items.map(function (item, index) { return (__assign(__assign({}, item), { index: index })); })
        .sort(function (a, b) { return a.top - b.top || a.index - b.index; });
    var tops = [];
    ordered.forEach(function (item, i) {
        tops[i] = Math.max(topInset, item.top, i ? tops[i - 1] + ordered[i - 1].height + exports.DOCK_GAP : topInset);
    });
    for (var i = ordered.length - 1; i >= 0; i--) {
        var bottom = i === ordered.length - 1 ? viewportHeight - bottomInset : tops[i + 1] - exports.DOCK_GAP;
        tops[i] = Math.min(tops[i], bottom - ordered[i].height);
    }
    var result = [];
    ordered.forEach(function (item, i) { result[item.index] = tops[i]; });
    return result;
}
exports.arrangeDock = arrangeDock;


/***/ }),

/***/ 597:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.installDockedPanels = exports.addDockedPanel = void 0;
var dock_layout_1 = __webpack_require__(595);
var STYLE_ID = 'reliquiensrtipz-docked-panels-style';
var STORAGE_KEY = 'reliquiensrtipz:docked-panels';
var PANEL_WIDTH = 220;
var HEADER_HEIGHT = 57;
var registerPanel;
function addDockedPanel(element, label, top, minHeight) {
    if (top === void 0) { top = 57; }
    if (minHeight === void 0) { minHeight = 0; }
    installDockedPanels();
    return registerPanel(element, label, top, minHeight);
}
exports.addDockedPanel = addDockedPanel;
function installDockedPanels() {
    var e_1, _a;
    if (document.getElementById(STYLE_ID))
        return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = "\n    .inventory-description { display: none !important; }\n    :is(#village_relic, #upgrade_panel, #relic-filter-window, #relic-preset-window, #relic-equip-window).relic-dock {\n      position: fixed;\n      z-index: 1000;\n      display: flex;\n      flex-direction: column;\n      align-items: stretch;\n      gap: 6px;\n      width: var(--relic-dock-width, ".concat(PANEL_WIDTH, "px);\n      max-width: 100vw;\n      height: auto;\n      min-width: 0;\n      min-height: 0;\n      margin: 0;\n      padding: 7px;\n      box-sizing: border-box;\n      overflow: auto;\n      scrollbar-width: none;\n      background: #f1e3c3;\n      border: 1px solid #a78c61;\n      border-radius: 9px;\n      box-shadow: 0 2px 5px #0002;\n    }\n    .relic-dock[hidden] { display: none !important; }\n    .relic-dock::-webkit-scrollbar, .relic-dock .choices::-webkit-scrollbar { display: none; }\n    .relic-dock .choices { scrollbar-width: none; }\n    .relic-dock .relic-dock-close { position: absolute; top: 7px; right: 7px; z-index: 2; }\n    :is(#relic-filter-window, #relic-preset-window, #relic-equip-window) .relic-dock-handle { padding-right: 76px; }\n    :is(#village_relic, #upgrade_panel, #relic-filter-window, #relic-preset-window, #relic-equip-window).relic-dock-left { border-radius: 0 9px 9px 0; }\n    :is(#village_relic, #upgrade_panel, #relic-filter-window, #relic-preset-window, #relic-equip-window).relic-dock-right { border-radius: 9px 0 0 9px; }\n    .relic-dock > * { flex-shrink: 0; }\n    #village_relic.relic-dock > div { width: 100%; min-width: 0; margin: 0; }\n    #village_relic.relic-dock > div:first-of-type { text-align: center; }\n    #village_relic.relic-dock #village_relic_image { width: 64px; height: 64px; object-fit: contain; }\n    #village_relic.relic-dock .village-details-container,\n    #village_relic.relic-dock .relic-details { width: 100%; min-width: 0; margin: 0; box-sizing: border-box; overflow-wrap: anywhere; }\n    #upgrade_panel.relic-dock #relics_to_upgrade {\n      display: flex;\n      align-items: center;\n      justify-content: center;\n      gap: 5px;\n      width: 100%;\n      margin: 0;\n    }\n    #upgrade_panel.relic-dock #relics_to_upgrade > div {\n      position: relative;\n      width: 58px;\n      height: 58px;\n      margin: 0;\n      flex: 0 0 58px;\n    }\n    #upgrade_panel.relic-dock #relics_to_upgrade img { width: 100%; height: 100%; object-fit: contain; }\n    #upgrade_panel.relic-dock #upgrade_relic_button { align-self: center; }\n    :is(#village_relic, #upgrade_panel, #relic-filter-window, #relic-preset-window, #relic-equip-window).relic-dock .relic-dock-handle {\n      position: sticky;\n      top: 0;\n      z-index: 1;\n      width: 100%;\n      padding: 4px 2px 6px;\n      border: 0;\n      border-bottom: 1px solid #c8b58e;\n      border-radius: 0;\n      background: #f1e3c3;\n      color: #6e593b;\n      font: 11px Verdana, sans-serif;\n      text-align: left;\n      cursor: ns-resize;\n      touch-action: none;\n      user-select: none;\n    }\n  ");
    document.head.appendChild(style);
    var saved = {};
    try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
    }
    catch ( /* Optional storage. */_b) { /* Optional storage. */ }
    var panels = [];
    var observer = new ResizeObserver(function () { return layout(); });
    var contentObserver = new MutationObserver(function (records) {
        var changed = panels.filter(function (panel) { return records.some(function (record) { return panel.element.contains(record.target); }); });
        layout(changed.length === 1 ? changed[0].element : undefined);
    });
    registerPanel = function (element, label, top, minHeight) {
        if (minHeight === void 0) { minHeight = 0; }
        var id = element.id;
        var state = saved[id];
        var panel = {
            element: element,
            minHeight: minHeight,
            side: (state === null || state === void 0 ? void 0 : state.side) === 'left' ? 'left' : 'right',
            top: typeof (state === null || state === void 0 ? void 0 : state.top) === 'number' && Number.isFinite(state.top) ? state.top : top
        };
        panels.push(panel);
        element.classList.add('relic-dock');
        var handle = document.createElement('button');
        handle.type = 'button';
        handle.className = 'relic-dock-handle';
        handle.textContent = "\u283F ".concat(label);
        handle.title = 'Vertikal ziehen · ab 40 % Bildschirmbreite zur anderen Seite wechseln';
        handle.setAttribute('aria-label', "".concat(label, ": am Bildschirmrand verschieben"));
        element.prepend(handle);
        var drag = null;
        handle.addEventListener('pointerdown', function (event) {
            if (event.button !== 0)
                return;
            drag = { id: event.pointerId, offsetY: event.clientY - element.getBoundingClientRect().top, startSide: panel.side };
            handle.setPointerCapture(event.pointerId);
            event.preventDefault();
        });
        handle.addEventListener('pointermove', function (event) {
            if ((drag === null || drag === void 0 ? void 0 : drag.id) !== event.pointerId)
                return;
            // Anchor the threshold to the starting side to avoid flickering around the middle.
            panel.side = drag.startSide === 'left'
                ? (event.clientX >= window.innerWidth * 0.4 ? 'right' : 'left')
                : (event.clientX <= window.innerWidth * 0.6 ? 'left' : 'right');
            panel.top = Math.max(HEADER_HEIGHT, event.clientY - drag.offsetY);
            layout(element);
        });
        var endDrag = function () {
            if (!drag)
                return;
            drag = null;
            save();
        };
        handle.addEventListener('pointerup', endDrag);
        handle.addEventListener('pointercancel', endDrag);
        handle.addEventListener('lostpointercapture', endDrag);
        handle.addEventListener('keydown', function (event) {
            if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key))
                return;
            event.preventDefault();
            if (event.key === 'ArrowLeft')
                panel.side = 'left';
            if (event.key === 'ArrowRight')
                panel.side = 'right';
            if (event.key === 'ArrowUp')
                panel.top -= event.shiftKey ? 1 : 10;
            if (event.key === 'ArrowDown')
                panel.top += event.shiftKey ? 1 : 10;
            layout(element);
            save();
        });
        observer.observe(element);
        contentObserver.observe(element, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'open'] });
        layout(element);
        return {
            setVisible: function (visible) { element.hidden = !visible; layout(visible ? element : undefined); },
            setTitle: function (title) { handle.textContent = "\u283F ".concat(title); handle.setAttribute('aria-label', "".concat(title, ": am Bildschirmrand verschieben")); }
        };
    };
    function save() {
        var positions = {};
        panels.forEach(function (panel) { positions[panel.element.id] = { side: panel.side, top: panel.top }; });
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
        }
        catch ( /* Optional storage. */_a) { /* Optional storage. */ }
    }
    function layout(preferred) {
        var visiblePanels = panels.filter(function (p) { return !p.element.hidden; });
        var naturalHeight = function (panel) { return Math.max(panel.minHeight, panel.element.scrollHeight + panel.element.offsetHeight - panel.element.clientHeight); };
        var widest = Math.max.apply(Math, __spreadArray([0], __read(visiblePanels.map(function (panel) { return panel.element.getBoundingClientRect().width; })), false));
        var sideChanged = false;
        if (window.innerWidth >= widest * 2 + dock_layout_1.DOCK_MARGIN * 2 + dock_layout_1.DOCK_GAP) {
            var sides_1 = (0, dock_layout_1.balanceDockSides)(visiblePanels.map(function (panel) { return ({ side: panel.side, height: naturalHeight(panel) }); }), window.innerHeight - HEADER_HEIGHT, visiblePanels.findIndex(function (panel) { return panel.element === preferred; }));
            visiblePanels.forEach(function (panel, index) {
                if (panel.side !== sides_1[index]) {
                    panel.side = sides_1[index];
                    sideChanged = true;
                }
            });
        }
        var left = visiblePanels.filter(function (p) { return p.side === 'left'; });
        var right = visiblePanels.filter(function (p) { return p.side === 'right'; });
        var width = function (group) { return Math.max.apply(Math, __spreadArray([0], __read(group.map(function (p) { return p.element.getBoundingClientRect().width; })), false)); };
        // Different panel widths still share a lane when the two edges would overlap.
        var groups = window.innerWidth < width(left) + width(right) + dock_layout_1.DOCK_MARGIN * 2 + dock_layout_1.DOCK_GAP
            ? [visiblePanels] : [left, right];
        groups.forEach(function (group) {
            if (!group.length)
                return;
            var available = window.innerHeight - HEADER_HEIGHT - dock_layout_1.DOCK_GAP * (group.length - 1);
            var limits = (0, dock_layout_1.dockHeightLimits)(group.map(naturalHeight), available);
            group.forEach(function (panel, index) {
                panel.element.style.maxHeight = "".concat(limits[index], "px");
                panel.element.style.minHeight = "".concat(Math.min(panel.minHeight, limits[index]), "px");
                panel.element.style.left = panel.side === 'left' ? '0' : 'auto';
                panel.element.style.right = panel.side === 'right' ? '0' : 'auto';
                panel.element.classList.toggle('relic-dock-left', panel.side === 'left');
                panel.element.classList.toggle('relic-dock-right', panel.side === 'right');
            });
            var positions = (0, dock_layout_1.arrangeDock)(group.map(function (panel) { return ({
                top: panel.top, height: panel.element.getBoundingClientRect().height
            }); }), window.innerHeight, HEADER_HEIGHT);
            group.forEach(function (panel, index) {
                panel.top = positions[index];
                panel.element.style.top = "".concat(panel.top, "px");
            });
        });
        if (sideChanged)
            save();
    }
    try {
        for (var _c = __values([
            ['village_relic', 'Dorf-Reliquie', 96], ['upgrade_panel', 'Aufwerten', 490]
        ]), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = __read(_d.value, 3), id = _e[0], label = _e[1], top_1 = _e[2];
            var element = document.getElementById(id);
            if (element)
                registerPanel(element, label, top_1);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
        }
        finally { if (e_1) throw e_1.error; }
    }
    layout();
    window.addEventListener('resize', function () { layout(); save(); });
    // Equipping/selecting relics can change panel height without a page reload.
}
exports.installDockedPanels = installDockedPanels;


/***/ }),

/***/ 30:
/***/ (function(__unused_webpack_module, exports) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isRelicActionDisabled = exports.cloneRelicDetails = void 0;
function cloneRelicDetails(details) {
    var clone = details.cloneNode(true);
    var nativeStats = details.querySelectorAll('.sub_stat');
    clone.querySelectorAll('.sub_stat').forEach(function (stat, i) {
        if (nativeStats[i])
            stat.style.color = getComputedStyle(nativeStats[i]).color;
    });
    clone.querySelectorAll('.buttons, script, iframe').forEach(function (node) { return node.remove(); });
    __spreadArray([clone], __read(Array.from(clone.querySelectorAll('*'))), false).forEach(function (node) {
        node.removeAttribute('id');
        node.removeAttribute('tabindex');
        if (node.tagName === 'A')
            node.removeAttribute('href');
        Array.from(node.attributes).filter(function (attribute) { return attribute.name.startsWith('on'); })
            .forEach(function (attribute) { return node.removeAttribute(attribute.name); });
    });
    return clone;
}
exports.cloneRelicDetails = cloneRelicDetails;
function isRelicActionDisabled(button) {
    return button.disabled || button.classList.contains('btn-disabled');
}
exports.isRelicActionDisabled = isRelicActionDisabled;


/***/ }),

/***/ 154:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createRelicEquipPanel = void 0;
var docked_panels_1 = __webpack_require__(597);
var relic_details_dom_1 = __webpack_require__(30);
function createRelicEquipPanel(grid, selectedDetails, selectNative, closeHover) {
    var panel = document.createElement('aside');
    panel.id = 'relic-equip-window';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Reliquie ausrüsten');
    document.body.append(panel);
    var style = document.createElement('style');
    style.textContent = "\n    #relic-equip-window { color: #412b13; font: 12px/1.4 Verdana, sans-serif; }\n    #relic-equip-window .relic-details { width: 100%; min-width: 0; margin: 0; padding: 0; border: 0; background: transparent; box-sizing: border-box; overflow-wrap: anywhere; }\n    #relic-equip-window .relic-details .header { display: grid; grid-template-columns: minmax(0, 1fr) 44px; gap: 6px; height: auto; min-height: 0; padding: 0; margin: 0; border: 0; background: transparent; }\n    #relic-equip-window .description { display: contents; }\n    #relic-equip-window .description strong { grid-column: 1; grid-row: 1; align-self: center; font-size: 12px; line-height: 1.3; }\n    #relic-equip-window .description p { grid-column: 1 / -1; grid-row: 2; margin: 0; font-size: 12px; line-height: 1.4; }\n    #relic-equip-window .image { grid-column: 2; grid-row: 1; width: 44px; height: 44px; margin: 0; padding: 0; }\n    #relic-equip-window .image img { display: block; width: 44px; height: 44px; object-fit: contain; }\n    #relic-equip-window .relic-details .body { height: auto; min-height: 0; margin: 7px 0 0; padding: 7px 0 0; border: 0; border-top: 1px solid #c8b58e; background: transparent; font-size: 11px; line-height: 1.4; }\n    #relic-equip-window .sub_stats { display: grid; gap: 5px; margin: 0 0 7px; padding: 0; }\n    #relic-equip-window .sub_stat { padding: 0; margin: 0; }\n    #relic-equip-window :is(.range,.discovered_by) { margin: 0; padding: 0; color: #6e593b; font-size: 10px; line-height: 1.4; }\n    #relic-equip-window .discovered_by a { color: inherit; font-weight: normal; }\n    #relic-equip-window .buttons { display: flex; justify-content: center; margin: 2px 0 0; }\n    #relic-equip-window .buttons button { font: inherit; font-weight: bold; padding: 4px 10px; border: 1px solid #563716; border-radius: 6px; background: #76502d; color: #fff4d9; text-shadow: none; box-shadow: none; cursor: pointer; }\n    #relic-equip-window .buttons button:is(:disabled,.btn-disabled) { opacity: .55; cursor: default; }\n    #relic-equip-window .relic-dock-close { cursor: pointer; font: 11px Verdana, sans-serif; padding: 3px 7px; border: 1px solid #b39a6b; border-radius: 6px; background: #f4e4c2; color: inherit; }\n    #relics > div.relic-equip-selected > img { box-shadow: inset 0 0 0 1px #24190d; }\n  ";
    document.head.append(style);
    var dock = (0, docked_panels_1.addDockedPanel)(panel, 'Ausrüsten');
    var pinnedId = null;
    var rendered = '';
    var content = document.createElement('div');
    var button = document.createElement('button');
    button.id = 'relic-equip-button';
    button.type = 'button';
    button.className = 'btn';
    var actions = document.createElement('div');
    actions.className = 'buttons';
    actions.append(button);
    var closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'relic-dock-close';
    closeButton.textContent = 'Schließen';
    closeButton.setAttribute('aria-label', 'Ausrüstfenster schließen');
    panel.append(closeButton, content, actions);
    var findTile = function () {
        var image = Array.from(grid.querySelectorAll('img[data-id]')).find(function (img) { return img.dataset.id === pinnedId; });
        return (image === null || image === void 0 ? void 0 : image.parentElement) || null;
    };
    var markSelection = function () {
        grid.querySelectorAll(':scope > div').forEach(function (tile) {
            var _a;
            tile.classList.toggle('relic-equip-selected', !!pinnedId && ((_a = tile.querySelector('img[data-id]')) === null || _a === void 0 ? void 0 : _a.dataset.id) === pinnedId);
        });
    };
    var close = function () { pinnedId = null; dock.setVisible(false); button.disabled = true; markSelection(); };
    closeButton.addEventListener('click', close);
    var render = function () {
        var _a;
        var tile = findTile();
        if (!tile || !tile.classList.contains('relic-selected'))
            return false;
        var details = selectedDetails.querySelector('.relic-details');
        if (!((_a = details === null || details === void 0 ? void 0 : details.textContent) === null || _a === void 0 ? void 0 : _a.trim())) {
            button.disabled = true;
            return false;
        }
        var clone = (0, relic_details_dom_1.cloneRelicDetails)(details);
        if (clone.outerHTML !== rendered) {
            rendered = clone.outerHTML;
            content.replaceChildren(clone);
        }
        var native = selectedDetails.querySelector('#equip_button');
        button.disabled = !native || (0, relic_details_dom_1.isRelicActionDisabled)(native);
        button.hidden = !native;
        button.className = (native === null || native === void 0 ? void 0 : native.className) || 'btn';
        button.textContent = (native === null || native === void 0 ? void 0 : native.textContent) || 'Ausrüsten';
        return true;
    };
    button.addEventListener('click', function () {
        if (!pinnedId || panel.hidden)
            return;
        var tile = findTile();
        if (!tile) {
            close();
            return;
        }
        closeHover();
        // Hover may have changed native selection. Restore the exact right-clicked relic first.
        if (!selectNative(tile) || !render()) {
            close();
            return;
        }
        var native = selectedDetails.querySelector('#equip_button');
        if (!native || (0, relic_details_dom_1.isRelicActionDisabled)(native))
            return;
        close();
        native.click(); // Keep the game's confirmation, cooldown and requests.
    });
    new MutationObserver(function () {
        if (!pinnedId)
            return;
        if (!findTile())
            close();
        else
            render();
    }).observe(selectedDetails, { childList: true, subtree: true, attributes: true, characterData: true });
    new MutationObserver(function () {
        if (!pinnedId)
            return;
        if (!findTile())
            close();
        else {
            markSelection();
            render();
        }
    }).observe(grid, { childList: true, subtree: true });
    return { select: function (tile) {
            var _a;
            var id = (_a = tile.querySelector('img[data-id]')) === null || _a === void 0 ? void 0 : _a.dataset.id;
            if (!id || !grid.contains(tile))
                return;
            if (!selectNative(tile)) {
                close();
                return;
            }
            pinnedId = id;
            if (!render()) {
                close();
                return;
            }
            markSelection();
            dock.setVisible(true);
        } };
}
exports.createRelicEquipPanel = createRelicEquipPanel;


/***/ }),

/***/ 756:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.relicGridCapacity = void 0;
function relicGridCapacity(width, availableHeight) {
    var gap = 2;
    var columns = Math.max(1, Math.min(10, Math.floor((width + gap) / (55.25 + gap))));
    var tileSize = Math.max(1, (width - gap * (columns - 1)) / columns);
    var rows = Math.max(1, Math.min(8, Math.floor((availableHeight + gap) / (tileSize + gap))));
    return { columns: columns, rows: rows, pageSize: columns * rows };
}
exports.relicGridCapacity = relicGridCapacity;


/***/ }),

/***/ 817:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.installRelicGridLayout = void 0;
var relic_grid_layout_1 = __webpack_require__(756);
var STYLE_ID = 'reliquiensrtipz-relic-grid';
// CSS also applies when the game replaces relic tiles after filtering/paging.
function installRelicGridLayout() {
    if (document.getElementById(STYLE_ID))
        return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = "\n    #page_inventory { min-width: 0; }\n    #page_inventory > #relics_container {\n      width: 100%;\n      max-width: none;\n      min-width: 0;\n      flex: 1 1 100%;\n      box-sizing: border-box;\n    }\n    #relics_container .relics-grid-row { width: 100%; min-width: 0; }\n    .relics-grid-row > #relics {\n      display: grid;\n      grid-template-columns: repeat(var(--relic-grid-columns, 10), minmax(0, 1fr));\n      flex: 1 1 0;\n      width: 0;\n      align-content: start;\n      gap: 2px;\n      min-width: 0;\n      height: auto;\n      padding: 2px;\n      box-sizing: border-box;\n    }\n\n    .relics-grid-row > #relics > div {\n      width: auto;\n      min-width: 0;\n      height: auto;\n      aspect-ratio: 1;\n      margin: 0;\n      box-sizing: border-box;\n    }\n\n    .relics-grid-row > #relics > div > img {\n      display: block;\n      width: 100%;\n      height: 100%;\n      object-fit: contain;\n    }\n  ";
    document.head.appendChild(style);
    var grid = document.getElementById('relics');
    if (!grid)
        return;
    var pending = false;
    var resize = function () {
        var _a;
        pending = false;
        var inventory = typeof RelicSystem === 'undefined' ? undefined : RelicSystem.Inventory;
        if (!inventory)
            return;
        var css = getComputedStyle(grid);
        var width = grid.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight);
        if (width <= 0)
            return;
        // Reserve room below the grid for the page footer; keep at least one row.
        var availableHeight = window.innerHeight - Math.max(57, grid.getBoundingClientRect().top) - 40;
        var _b = (0, relic_grid_layout_1.relicGridCapacity)(width, availableHeight), columns = _b.columns, rows = _b.rows, pageSize = _b.pageSize;
        grid.style.setProperty('--relic-grid-columns', String(columns));
        grid.dataset.rows = String(rows);
        if (inventory.relics_per_page === pageSize)
            return;
        var firstItem = inventory.page * inventory.relics_per_page;
        inventory.relics_per_page = pageSize;
        inventory.page = Math.min(inventory.getMaxPage(), Math.floor(firstItem / pageSize));
        inventory.RelicsGridPanel.deselectRelic();
        (_a = document.getElementById('relic-hover-details')) === null || _a === void 0 ? void 0 : _a.setAttribute('hidden', '');
        inventory.updateUI();
    };
    var scheduleResize = function () {
        if (pending)
            return;
        pending = true;
        requestAnimationFrame(resize);
    };
    new ResizeObserver(scheduleResize).observe(grid);
    window.addEventListener('resize', scheduleResize);
    scheduleResize();
}
exports.installRelicGridLayout = installRelicGridLayout;


/***/ }),

/***/ 724:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.installRelicHoverDetails = void 0;
var relic_details_dom_1 = __webpack_require__(30);
var relic_equip_panel_1 = __webpack_require__(154);
var STYLE_ID = 'reliquiensrtipz-relic-hover-details-style';
var TOOLTIP_ID = 'relic-hover-details';
function installRelicHoverDetails() {
    var grid = document.getElementById('relics');
    var selectedDetails = document.getElementById('selected_relic_details');
    if (!grid || !selectedDetails || document.getElementById(TOOLTIP_ID))
        return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = "\n    #selected_relic_details { display: none !important; }\n    #".concat(TOOLTIP_ID, " {\n      position: fixed;\n      z-index: 1001;\n      width: 245px;\n      max-width: calc(100vw - 16px);\n      max-height: calc(100vh - 73px);\n      padding: 8px;\n      box-sizing: border-box;\n      overflow: auto;\n      pointer-events: none;\n      background: #f1e3c3;\n      border: 1px solid #a78c61;\n      border-radius: 7px;\n      box-shadow: 0 3px 10px #0004;\n      color: #24190d;\n      font-size: 12px;\n    }\n    #").concat(TOOLTIP_ID, "[hidden] { display: none; }\n    #").concat(TOOLTIP_ID, " .relic-details { width: 100%; min-width: 0; margin: 0; box-sizing: border-box; overflow-wrap: anywhere; }\n    #").concat(TOOLTIP_ID, " .header { display: flex; align-items: flex-start; gap: 6px; }\n    #").concat(TOOLTIP_ID, " .description { flex: 1; min-width: 0; }\n    #").concat(TOOLTIP_ID, " .image { flex: 0 0 56px; }\n    #").concat(TOOLTIP_ID, " .image img { display: block; width: 56px; height: 56px; object-fit: contain; }\n  ");
    document.head.appendChild(style);
    var tooltip = document.createElement('aside');
    tooltip.id = TOOLTIP_ID;
    tooltip.hidden = true;
    tooltip.setAttribute('aria-live', 'polite');
    document.body.appendChild(tooltip);
    var detailContent = document.createElement('div');
    tooltip.append(detailContent);
    var hoveredId = null;
    var activeTile = null;
    var allowingGameTileClick = false;
    var renderedDetails = '';
    var close = function () {
        tooltip.hidden = true;
        hoveredId = null;
        activeTile = null;
    };
    var contains = function (element, target) {
        return target instanceof Node && element.contains(target);
    };
    var position = function (tile) {
        var rect = tile.getBoundingClientRect();
        var width = tooltip.getBoundingClientRect().width;
        var height = tooltip.getBoundingClientRect().height;
        // The preview may overlap neighbours, but never intercepts their pointer events.
        var side = rect.right + width <= window.innerWidth - 8 ? rect.right : rect.left - width;
        var left = Math.max(8, Math.min(side, window.innerWidth - width - 8));
        var top = Math.max(57, Math.min(rect.top, window.innerHeight - height - 8));
        tooltip.style.left = "".concat(left, "px");
        tooltip.style.top = "".concat(top, "px");
    };
    var captureDetails = function (tile) {
        var _a, _b;
        var id = (_a = tile.querySelector('img[data-id]')) === null || _a === void 0 ? void 0 : _a.dataset.id;
        var details = selectedDetails.querySelector('.relic-details');
        if (!grid.contains(tile) || id !== hoveredId || !((_b = details === null || details === void 0 ? void 0 : details.textContent) === null || _b === void 0 ? void 0 : _b.trim()) || !tile.classList.contains('relic-selected')) {
            close();
            return;
        }
        var clone = (0, relic_details_dom_1.cloneRelicDetails)(details);
        if (clone.outerHTML !== renderedDetails) {
            renderedDetails = clone.outerHTML;
            detailContent.replaceChildren(clone);
        }
        tooltip.hidden = false;
        position(tile);
    };
    var selectNative = function (tile) {
        var image = tile.querySelector('img[data-id]');
        if (!image || !grid.contains(tile))
            return false;
        if (!tile.classList.contains('relic-selected')) {
            allowingGameTileClick = true;
            try {
                // The game's native listener is attached to IMG, not its wrapping DIV.
                image.click();
            }
            finally {
                allowingGameTileClick = false;
            }
        }
        return tile.classList.contains('relic-selected');
    };
    var selectForDetails = function (tile) {
        var _a;
        activeTile = tile;
        hoveredId = ((_a = tile.querySelector('img[data-id]')) === null || _a === void 0 ? void 0 : _a.dataset.id) || null;
        if (!selectNative(tile)) {
            close();
            return;
        }
        captureDetails(tile);
    };
    var equipPanel = (0, relic_equip_panel_1.createRelicEquipPanel)(grid, selectedDetails, selectNative, close);
    grid.addEventListener('contextmenu', function (event) {
        var tile = event.target.closest('#relics > div');
        if (!(tile === null || tile === void 0 ? void 0 : tile.querySelector('img[data-id]')))
            return;
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
        equipPanel.select(tile);
    }, true);
    grid.addEventListener('pointerover', function (event) {
        var tile = event.target.closest('#relics > div');
        if (!tile || contains(tile, event.relatedTarget))
            return;
        // The game creates details only after selecting a tile. Hover intentionally selects it.
        selectForDetails(tile);
    });
    grid.addEventListener('pointerout', function (event) {
        var tile = event.target.closest('#relics > div');
        if (!tile || contains(tile, event.relatedTarget))
            return;
        close();
    });
    window.addEventListener('blur', close);
    window.addEventListener('resize', close);
    document.addEventListener('visibilitychange', function () { if (document.hidden)
        close(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape')
        close(); });
    document.addEventListener('scroll', function (event) {
        if (!contains(tooltip, event.target))
            close();
    }, true);
    // Follow native detail/eligibility changes without retaining stale relic snapshots.
    var detailObserver = new MutationObserver(function () {
        if (activeTile)
            captureDetails(activeTile);
    });
    detailObserver.observe(selectedDetails, { childList: true, subtree: true, characterData: true, attributes: true });
    new MutationObserver(function () {
        var _a;
        if (activeTile && (!grid.contains(activeTile) || ((_a = activeTile.querySelector('img[data-id]')) === null || _a === void 0 ? void 0 : _a.dataset.id) !== hoveredId))
            close();
    }).observe(grid, { childList: true, subtree: true });
    grid.addEventListener('click', function (event) {
        var tile = event.target.closest('#relics > div');
        if (!tile || event.button !== 0)
            return;
        if (allowingGameTileClick)
            return;
        // A normal click adds through the game's own detail action, which fills the next free slot.
        event.preventDefault();
        event.stopImmediatePropagation();
        selectForDetails(tile);
        if (tile.classList.contains('relic-selected')) {
            var addButton = document.getElementById('add_relic_to_upgrade_panel_button');
            close();
            if (addButton && !(0, relic_details_dom_1.isRelicActionDisabled)(addButton))
                addButton.click();
        }
    }, true);
}
exports.installRelicHoverDetails = installRelicHoverDetails;


/***/ }),

/***/ 288:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.installRelicOnboarding = void 0;
var DIALOG_ID = 'relic-onboarding';
var STORAGE_KEY = 'reliquiensrtipz:onboarding-seen';
function installRelicOnboarding() {
    var line = document.querySelector('#relic-search .search-line');
    if (!line || !document.getElementById('relics') || document.getElementById(DIALOG_ID))
        return;
    var style = document.createElement('style');
    style.textContent = "\n    #".concat(DIALOG_ID, " { position: fixed; width: min(560px, calc(100vw - 32px)); max-height: calc(100vh - 80px); box-sizing: border-box; overflow: auto; padding: 22px; border: 1px solid #a78c61; border-radius: 9px; background: #f1e3c3; color: #412b13; font: 12px/1.5 Verdana, sans-serif; box-shadow: 0 4px 24px #0004; }\n    #").concat(DIALOG_ID, "::backdrop { background: #0006; }\n    #").concat(DIALOG_ID, " h2 { margin: 0 28px 4px 0; font-size: 18px; }\n    #").concat(DIALOG_ID, " .intro { margin: 0 0 14px; }\n    #").concat(DIALOG_ID, " .tips { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 0; }\n    #").concat(DIALOG_ID, " .tips > div { padding: 10px; background: #fff4d9; border: 1px solid #c8b58e; border-radius: 6px; }\n    #").concat(DIALOG_ID, " .tips > .click-tip { border-top: 3px solid #76502d; }\n    #").concat(DIALOG_ID, " dt { font-weight: bold; margin-bottom: 4px; }\n    #").concat(DIALOG_ID, " dd { margin: 0; }\n    #").concat(DIALOG_ID, " .footer-note { margin: 12px 0; font-size: 11px; }\n    #").concat(DIALOG_ID, " .actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; }\n    #").concat(DIALOG_ID, " button { cursor: pointer; font: inherit; padding: 5px 10px; border: 1px solid #b39a6b; border-radius: 6px; background: #f4e4c2; color: inherit; }\n    #").concat(DIALOG_ID, " button.primary { background: #76502d; color: #fff4d9; border-color: #563716; }\n    #").concat(DIALOG_ID, " .close { position: absolute; top: 10px; right: 10px; padding: 2px 8px; font-size: 18px; }\n    #").concat(DIALOG_ID, " button:focus-visible { outline: 2px solid #915dac; outline-offset: 2px; }\n    #relic-onboarding-help { flex-shrink: 0; }\n    @media (max-width: 480px) { #").concat(DIALOG_ID, " { padding: 16px; } #").concat(DIALOG_ID, " .tips { grid-template-columns: minmax(0, 1fr); gap: 8px; } }\n  ");
    document.head.append(style);
    var dialog = document.createElement('dialog');
    dialog.id = DIALOG_ID;
    dialog.setAttribute('aria-labelledby', 'relic-onboarding-title');
    dialog.setAttribute('aria-describedby', 'relic-onboarding-intro');
    dialog.innerHTML = "\n    <h2 id=\"relic-onboarding-title\" tabindex=\"-1\">Reliquien \u2013 kurz erkl\u00E4rt</h2>\n    <p id=\"relic-onboarding-intro\" class=\"intro\">Die wichtigsten Handgriffe f\u00FCr dein Inventar.</p>\n    <dl class=\"tips\">\n      <div class=\"click-tip\"><dt>Linksklick \u2192 Aufwertung</dt><dd>Legt die Reliquie in den n\u00E4chsten freien Aufwertungsslot. Die eigentliche Aufwertung startest du danach \u00FCber den Aufwertungsbutton.</dd></div>\n      <div class=\"click-tip\"><dt>Rechtsklick \u2192 Ausr\u00FCsten</dt><dd>W\u00E4hlt die Reliquie im Ausr\u00FCstfenster am Rand aus. Dort kannst du auf \u201EAusr\u00FCsten\u201C klicken und die Spielbest\u00E4tigung pr\u00FCfen.</dd></div>\n      <div><dt>Hover-Vorschau</dt><dd>Fahre \u00FCber eine Kachel, um ihre Stats zu sehen. Du kannst direkt weiter \u00FCber andere Kacheln fahren; die Vorschau ist f\u00FCr die Maus durchl\u00E4ssig.</dd></div>\n      <div><dt>Suche</dt><dd>Durchsuche Namen, Typen und Boni, zum Beispiel mit \u201Eshiny kata def\u201C. Die Treffer passen sich sofort an.</dd></div>\n      <div><dt>Filter & Sortierung</dt><dd>Grenze nach Qualit\u00E4t, Typ, Substats oder Shiny ein und \u00E4ndere die Reihenfolge. \u201EZur\u00FCcksetzen\u201C leert Suche und Filter und stellt die Standardsortierung her.</dd></div>\n      <div><dt>Presets</dt><dd>Aktiviere deine Wunschkombinationen: Passende Reliquien bekommen einen farbigen Rahmen. Der Stift \u00F6ffnet den Editor. Pink markiert zus\u00E4tzlich perfekte Substats.</dd></div>\n    </dl>\n    <p class=\"footer-note\">Die Randfenster kannst du an den Kopfzeilen verschieben. Diese Hilfe findest du sp\u00E4ter \u00FCber \u201E?\u201C neben der Suche.</p>\n  ";
    document.body.append(dialog);
    var help = document.createElement('button');
    help.type = 'button';
    help.id = 'relic-onboarding-help';
    help.textContent = '?';
    help.title = 'Bedienung des Scripts';
    help.setAttribute('aria-label', 'Script-Hilfe öffnen');
    help.setAttribute('aria-controls', DIALOG_ID);
    line.append(help);
    var previousFocus = null;
    var open = function () {
        if (dialog.open)
            return;
        previousFocus = document.activeElement;
        dialog.showModal();
        dialog.querySelector('h2').focus();
    };
    var dismiss = function () {
        try {
            localStorage.setItem(STORAGE_KEY, '1');
        }
        catch ( /* Dismiss remains available without storage. */_a) { /* Dismiss remains available without storage. */ }
        dialog.close();
        var target = previousFocus && previousFocus !== document.body && previousFocus.isConnected
            ? previousFocus : document.getElementById('relic-search-input') || help;
        target.focus();
    };
    var button = function (text, className) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = text;
        b.className = className;
        b.addEventListener('click', dismiss);
        return b;
    };
    var close = button('×', 'close');
    close.setAttribute('aria-label', 'Einführung schließen');
    var actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(button('Verstanden', 'primary'));
    dialog.prepend(close);
    dialog.append(actions);
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); dismiss(); });
    help.addEventListener('click', open);
    var seen = false;
    try {
        seen = localStorage.getItem(STORAGE_KEY) === '1';
    }
    catch ( /* Still show the introduction if storage is unavailable. */_a) { /* Still show the introduction if storage is unavailable. */ }
    if (!seen)
        open();
}
exports.installRelicOnboarding = installRelicOnboarding;


/***/ }),

/***/ 326:
/***/ (function(__unused_webpack_module, exports) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.seedDefaultPresets = exports.DEFAULT_PRESETS = void 0;
exports.DEFAULT_PRESETS = [
    { id: 'default:axe-off', name: 'Axt · Axt + LK Angriff', enabled: true, type: 'greataxe', substats: ['24', '26'] },
    { id: 'default:light-off', name: 'LK · Axt + LK Angriff', enabled: true, type: 'shortspear', substats: ['24', '26'] },
    { id: 'default:spear-heavy-def', name: 'Speer · SK + Speer Def', enabled: true, type: 'halberd', substats: ['37', '31'] },
    { id: 'default:heavy-spear-def', name: 'SK · Speer + SK Def', enabled: true, type: 'banner', substats: ['31', '37'] },
    { id: 'default:sword-spear-def', name: 'Schwert · Schwert + Speer Def', enabled: true, type: 'longsword', substats: ['32', '31'] },
    { id: 'default:spear-sword-def', name: 'Speer · Schwert + Speer Def', enabled: true, type: 'halberd', substats: ['32', '31'] },
    { id: 'default:economy', name: 'Rohstoffe & Beute', enabled: true, type: '', substats: ['15', '16', '14', 'barracks-cost', '13'], allBonuses: true }
];
function seedDefaultPresets(presets, installed) {
    var next = presets.slice();
    exports.DEFAULT_PRESETS.forEach(function (preset) {
        if (!installed.includes(preset.id) && !next.some(function (p) { return p.id === preset.id; }))
            next.push(__assign(__assign({}, preset), { substats: preset.substats.slice() }));
    });
    return { presets: next, installed: Array.from(new Set(__spreadArray(__spreadArray([], __read(installed), false), __read(exports.DEFAULT_PRESETS.map(function (p) { return p.id; })), false))) };
}
exports.seedDefaultPresets = seedDefaultPresets;


/***/ }),

/***/ 362:
/***/ (function(__unused_webpack_module, exports) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.writePresets = exports.installedDefaultIds = exports.readPresets = exports.matchesPreset = exports.MAIN_BONUSES = exports.presetColor = exports.DEFAULT_PRESET_COLOR = void 0;
exports.DEFAULT_PRESET_COLOR = '#d2d51b';
function presetColor(raw) {
    var _a;
    try {
        var color = (_a = JSON.parse(raw || 'null')) === null || _a === void 0 ? void 0 : _a.color;
        return typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : exports.DEFAULT_PRESET_COLOR;
    }
    catch (_b) {
        return exports.DEFAULT_PRESET_COLOR;
    }
}
exports.presetColor = presetColor;
exports.MAIN_BONUSES = {
    halberd: '1', longsword: '2', greataxe: '3', shortspear: '5', banner: '7',
    bonfire: '8', morningstar: '9', dummy: '10', horseshoe: '11', wheel: '12',
    backpack: 'barracks-cost', chisel: '14', axe: '15', pickaxe: '16',
    saddle: 'stable-cost', handsaw: 'workshop-cost'
};
var COMBINED = {
    '22': '1', '31': '1', '23': '2', '32': '2', '24': '3', '33': '3',
    '26': '5', '35': '5', '28': '7', '37': '7'
};
function accepts(actual, wanted) {
    var id = String(actual.id);
    if (id === wanted)
        return true;
    if (wanted === 'barracks-cost')
        return /(?:rekrutierungskosten.*kaserne|kaserne.*rekrutierungskosten)/i.test(actual.name || '');
    return COMBINED[wanted] === id;
}
function matchesPreset(relic, preset) {
    if (!preset.enabled || (!preset.type && !preset.substats.length))
        return false;
    var stats = relic.sub_stats || [];
    if (preset.shinyOnly && !stats.some(function (stat) { return stat.perfect === true; }))
        return false;
    if (preset.allBonuses) {
        var main_1 = exports.MAIN_BONUSES[relic.type];
        return stats.length === 2 && !!main_1 && preset.substats.some(function (wanted) { return accepts({ id: main_1 }, wanted); }) &&
            stats.every(function (stat) { return preset.substats.some(function (wanted) { return accepts(stat, wanted); }); });
    }
    if (preset.type && relic.type !== preset.type)
        return false;
    // Each condition needs its own stat; a combined bonus must not fill two slots.
    var match = function (index, used) { return index === preset.substats.length ||
        stats.some(function (stat, slot) { return !used.has(slot) && accepts(stat, preset.substats[index]) &&
            match(index + 1, new Set(__spreadArray(__spreadArray([], __read(used), false), [slot], false))); }); };
    return match(0, new Set());
}
exports.matchesPreset = matchesPreset;
// Reject a malformed rule as a whole: dropping one condition would broaden it.
function readPresets(raw) {
    try {
        var data = JSON.parse(raw || 'null');
        if (!data || typeof data !== 'object')
            return [];
        var stored = data;
        if ((stored.version !== 1 && stored.version !== 2) || !Array.isArray(stored.presets))
            return [];
        var result_1 = [];
        stored.presets.forEach(function (value) {
            if (!value || typeof value !== 'object')
                return;
            var p = value;
            if (typeof p.id !== 'string' || !p.id.trim() || result_1.some(function (item) { return item.id === p.id; }) ||
                typeof p.name !== 'string' || !p.name.trim() || p.name.length > 80 ||
                typeof p.enabled !== 'boolean' || typeof p.type !== 'string' ||
                !Array.isArray(p.substats) || p.substats.some(function (id) { return typeof id !== 'string' || !id.trim(); }) ||
                new Set(p.substats).size !== p.substats.length || (!p.type && !p.substats.length) ||
                (p.allBonuses !== undefined && typeof p.allBonuses !== 'boolean') ||
                (p.shinyOnly !== undefined && typeof p.shinyOnly !== 'boolean') || (p.allBonuses && (p.type || !p.substats.length)))
                return;
            result_1.push(__assign(__assign({ id: p.id, name: p.name.trim(), enabled: p.enabled, type: p.type, substats: p.substats.slice() }, (p.allBonuses === undefined ? {} : { allBonuses: p.allBonuses })), (p.shinyOnly === undefined ? {} : { shinyOnly: p.shinyOnly })));
        });
        return result_1;
    }
    catch (_a) {
        return [];
    }
}
exports.readPresets = readPresets;
function installedDefaultIds(raw) {
    try {
        var data = JSON.parse(raw || 'null');
        return (data === null || data === void 0 ? void 0 : data.version) === 2 && Array.isArray(data.installedDefaults) && data.installedDefaults.every(function (id) { return typeof id === 'string'; }) ? data.installedDefaults : [];
    }
    catch (_a) {
        return [];
    }
}
exports.installedDefaultIds = installedDefaultIds;
function writePresets(presets, installedDefaults, color) {
    if (installedDefaults === void 0) { installedDefaults = []; }
    if (color === void 0) { color = exports.DEFAULT_PRESET_COLOR; }
    return JSON.stringify({ version: 2, presets: presets, installedDefaults: installedDefaults, color: color });
}
exports.writePresets = writePresets;


/***/ }),

/***/ 877:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.installRelicPresets = void 0;
var docked_panels_1 = __webpack_require__(597);
var relic_preset_model_1 = __webpack_require__(362);
var relic_preset_defaults_1 = __webpack_require__(326);
var WINDOW_ID = 'relic-preset-window';
var STORAGE_KEY = 'reliquiensrtipz:relic-presets';
var EDITOR_ID = 'relic-preset-editor';
function installRelicPresets() {
    var grid = document.getElementById('relics');
    var line = document.querySelector('#relic-search .search-line');
    if (!grid || !line || document.getElementById(WINDOW_ID) || typeof RelicSystem === 'undefined')
        return;
    var options = function (id) { return Array.from(document.querySelectorAll("#".concat(id, " option")))
        .filter(function (o) { return o.value && o.value !== 'null'; }).map(function (o) { return ({ value: o.value, label: o.textContent || o.value }); }); };
    var types = options('inventory_filter_type');
    var stats = options('inventory_filter_sub1');
    if (!types.length || !stats.length)
        return;
    stats.push({ value: 'barracks-cost', label: 'Kaserne: Rekrutierungskosten reduzieren' });
    // Reuse this world's current asset version instead of pinning a CDN hash.
    var graphicImage = Array.from(document.images).find(function (image) { return image.src.includes('/graphic/'); });
    var graphicBase = graphicImage === null || graphicImage === void 0 ? void 0 : graphicImage.src.split('/graphic/')[0];
    var units = [
        ['Speerträger', 'spear'], ['Schwertkämpfer', 'sword'], ['Axtkämpfer', 'axe'],
        ['Leichte Kavallerie', 'light'], ['Schwere Kavallerie', 'heavy'], ['Späher', 'spy'],
        ['Rammbock', 'ram'], ['Katapult', 'catapult']
    ];
    var bonusBadge = function (fullLabel, main, compact) {
        var _a, _b;
        if (main === void 0) { main = false; }
        if (compact === void 0) { compact = false; }
        var badge = document.createElement('span');
        badge.className = 'preset-bonus';
        var mainType = main ? (_a = types.find(function (t) { return t.label === fullLabel; })) === null || _a === void 0 ? void 0 : _a.value : undefined;
        var bonusLabel = mainType ? ((_b = stats.find(function (s) { return s.value === relic_preset_model_1.MAIN_BONUSES[mainType]; })) === null || _b === void 0 ? void 0 : _b.label) || fullLabel : fullLabel;
        var clean = bonusLabel.replace(/[+\-−]?x%\s*/g, '').trim();
        var unit = units.find(function (_a) {
            var _b = __read(_a, 1), label = _b[0];
            return clean.startsWith("".concat(label, ":"));
        });
        badge.title = clean;
        badge.setAttribute('aria-label', clean);
        var caption = clean;
        if (unit && graphicBase) {
            var image = document.createElement('img');
            image.src = "".concat(graphicBase, "/graphic/unit/unit_").concat(unit[1], ".webp");
            image.alt = unit[0];
            image.width = 18;
            image.height = 18;
            caption = compact ? '' : clean.slice(unit[0].length + 1).trim()
                .replace('Angriffs- und Verteidigungsstärke', 'Angr./Vert.')
                .replace('Angriffsstärke', 'Angriff').replace('Verteidigungsstärke', 'Verteidigung');
            image.addEventListener('error', function () { badge.replaceChildren(document.createTextNode(clean)); }, { once: true });
            badge.append(image);
        }
        if (compact && unit) {
            var kind = document.createElement('sup');
            kind.textContent = /Angriffs- und Verteidigungs/.test(clean) ? 'A/D' : /Angriff/.test(clean) ? 'A' : /Verteidigung/.test(clean) ? 'D' : '';
            badge.append(kind);
        }
        else if (caption)
            badge.append(document.createTextNode(caption));
        return badge;
    };
    var presets = [];
    var installed = [];
    var color = relic_preset_model_1.DEFAULT_PRESET_COLOR;
    var storageMessage = '';
    try {
        var raw = localStorage.getItem(STORAGE_KEY);
        color = (0, relic_preset_model_1.presetColor)(raw);
        var seeded = (0, relic_preset_defaults_1.seedDefaultPresets)((0, relic_preset_model_1.readPresets)(raw), (0, relic_preset_model_1.installedDefaultIds)(raw));
        presets = seeded.presets;
        installed = seeded.installed;
        localStorage.setItem(STORAGE_KEY, (0, relic_preset_model_1.writePresets)(presets, installed, color));
    }
    catch (_a) {
        var seeded = (0, relic_preset_defaults_1.seedDefaultPresets)(presets, installed);
        presets = seeded.presets;
        installed = seeded.installed;
        storageMessage = 'Nur für diese Sitzung: Browser-Speicher nicht verfügbar.';
    }
    var editingId = null;
    var selectedStats = new Set();
    var style = document.createElement('style');
    style.textContent = "\n    #relics > div.relic-preset { position: relative; }\n    #relics > div.relic-preset::after {\n      content: ''; position: absolute; inset: 0; border: 3px solid var(--relic-preset-color, ".concat(relic_preset_model_1.DEFAULT_PRESET_COLOR, ");\n      box-sizing: border-box; pointer-events: none; z-index: 1;\n      box-shadow: 0 0 0 1px #443b29 inset;\n    }\n    #relics > div.relic-preset.relic-shiny::after { inset: 6px; border-width: 2px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") { color: #412b13; font-size: 12px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ").relic-dock { gap: 4px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") [hidden] { display: none !important; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") button:not(.relic-dock-handle) { cursor: pointer; font: inherit; padding: 3px 7px; border: 1px solid #b39a6b; border-radius: 8px; color: inherit; background: #f4e4c2; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") :is(button,input,select):focus-visible { outline: 2px solid #3687ff; outline-offset: 1px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-list { display: grid; gap: 0; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-card { display: flex; align-items: center; gap: 3px; height: 20px; border-left: 2px solid var(--relic-preset-color, ").concat(relic_preset_model_1.DEFAULT_PRESET_COLOR, "); padding-left: 3px; }\n    #").concat(WINDOW_ID, " .preset-toolbar { display: flex; align-items: center; justify-content: space-between; min-height: 18px; }\n    #").concat(WINDOW_ID, " .preset-color-label { display: flex; align-items: center; gap: 4px; font-size: 11px; }\n    #").concat(WINDOW_ID, " input[type=\"color\"] { width: 24px; height: 18px; padding: 0; border: 1px solid #ab8955; cursor: pointer; background: transparent; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-card > label { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; cursor: pointer; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-card .preset-name { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-card .preset-summary { display: flex; align-items: center; gap: 2px; margin: 0; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-card .preset-bonus { padding: 0; gap: 0; background: transparent; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-card sup { font-size: 8px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-card .preset-edit { padding: 1px 4px; margin-left: auto; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-group { font-size: 10px; line-height: 12px; margin: 2px 0 0; }\n    #").concat(EDITOR_ID, " { width: min(420px,calc(100vw - 48px)); max-height: calc(100vh - 80px); box-sizing: border-box; padding: 18px; border: 1px solid #ab8955; border-radius: 8px; background: #fff0cf; }\n    #").concat(EDITOR_ID, "::backdrop { background: #0006; }\n    #").concat(EDITOR_ID, " .preset-summary { margin-top: 8px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-summary { display: grid; gap: 4px; font-size: 11px; margin: 5px 0; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-bonuses { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-bonus { display: inline-flex; align-items: center; gap: 3px; min-height: 18px; padding: 2px 4px; background: #f4e4c2; border-radius: 4px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-bonus img { width: 18px; height: 18px; flex-shrink: 0; object-fit: contain; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-actions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") form { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") form > :is(strong,.preset-stat-editor,.preset-actions) { grid-column: 1 / -1; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") form > label { display: grid; gap: 3px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") :is(input[type=\"text\"],select) { width: 100%; box-sizing: border-box; min-width: 0; padding: 4px; color: inherit; background: #fff6df; border: 1px solid #ab8955; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-stat-editor { display: grid; gap: 4px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-stat-picker { display: flex; gap: 5px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-stat-picker select { flex: 1; width: 0; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-selected-stats { display: flex; flex-wrap: wrap; gap: 4px; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-selected-stats button { font-size: 11px; text-align: left; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") input[type=\"checkbox\"] { flex-shrink: 0; margin: 1px 0; }\n    :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") .preset-empty, :is(#").concat(WINDOW_ID, ",#").concat(EDITOR_ID, ") output { font-size: 11px; margin: 0; overflow-wrap: anywhere; }\n  ");
    document.head.append(style);
    var button = function (label, action) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.addEventListener('click', action);
        return b;
    };
    var panel = document.createElement('aside');
    panel.id = WINDOW_ID;
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Reliquien-Presets');
    document.body.append(panel);
    var dock = (0, docked_panels_1.addDockedPanel)(panel, 'Presets', 57, 340);
    var trigger = button('Presets', function () { return setOpen(panel.hidden); });
    trigger.id = 'relic-preset-trigger';
    trigger.setAttribute('aria-controls', WINDOW_ID);
    trigger.setAttribute('aria-expanded', 'false');
    line.insertBefore(trigger, line.lastElementChild);
    function setOpen(open) { dock.setVisible(open); trigger.setAttribute('aria-expanded', String(open)); }
    var closeButton = button('Schließen', function () { setOpen(false); trigger.focus(); });
    closeButton.className = 'relic-dock-close';
    closeButton.setAttribute('aria-label', 'Presetfenster schließen');
    var count = document.createElement('output');
    count.setAttribute('aria-live', 'polite');
    var toolbar = document.createElement('div');
    toolbar.className = 'preset-toolbar';
    var colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.id = 'relic-preset-color';
    colorPicker.value = color;
    colorPicker.setAttribute('aria-label', 'Preset-Rahmenfarbe');
    colorPicker.title = 'Preset-Rahmenfarbe';
    var colorLabel = document.createElement('label');
    colorLabel.className = 'preset-color-label';
    colorLabel.append(document.createTextNode('Farbe'), colorPicker);
    toolbar.append(count, colorLabel);
    colorPicker.addEventListener('input', function () { color = colorPicker.value; applyColor(); });
    colorPicker.addEventListener('change', function () { color = colorPicker.value; applyColor(); persist(); });
    var list = document.createElement('div');
    list.className = 'preset-list';
    var message = document.createElement('output');
    message.setAttribute('aria-live', 'polite');
    message.id = 'relic-preset-message';
    var form = document.createElement('form');
    form.id = 'relic-preset-form';
    form.hidden = true;
    var heading = document.createElement('strong');
    heading.textContent = 'Neues Preset';
    heading.id = 'relic-preset-editor-title';
    var modal = document.createElement('dialog');
    modal.id = EDITOR_ID;
    modal.setAttribute('aria-labelledby', heading.id);
    document.body.append(modal);
    function applyColor() { [grid, panel, modal].forEach(function (element) { return element.style.setProperty('--relic-preset-color', color); }); }
    applyColor();
    var returnFocus = null;
    var editorMessage = document.createElement('output');
    editorMessage.setAttribute('aria-live', 'polite');
    var name = document.createElement('input');
    name.type = 'text';
    name.id = 'relic-preset-name';
    name.required = true;
    name.maxLength = 80;
    name.placeholder = 'z. B. Axt + LK Off';
    var type = document.createElement('select');
    type.id = 'relic-preset-type';
    var mode = document.createElement('select');
    mode.id = 'relic-preset-mode';
    mode.innerHTML = '<option value="exact">Typ und gewünschte Substats</option><option value="all">Alle 3 Boni aus der Auswahl</option>';
    var shiny = document.createElement('input');
    shiny.type = 'checkbox';
    shiny.id = 'relic-preset-shiny';
    mode.addEventListener('change', function () { type.disabled = mode.value === 'all'; if (type.disabled)
        type.value = ''; });
    var label = function (text, control) {
        var l = document.createElement('label');
        l.append(document.createTextNode(text), control);
        return l;
    };
    var checkboxLabel = function (text, control) {
        var l = document.createElement('label');
        var caption = document.createElement('span');
        caption.textContent = text;
        l.append(control, caption);
        return l;
    };
    var addOption = function (value, text) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        type.append(option);
    };
    addOption('', 'Beliebiger Typ');
    types.forEach(function (choice) { return addOption(choice.value, choice.label); });
    var statEditor = document.createElement('section');
    statEditor.className = 'preset-stat-editor';
    var statSelect = document.createElement('select');
    statSelect.id = 'relic-preset-substat';
    var statCaption = document.createElement('label');
    statCaption.htmlFor = statSelect.id;
    statCaption.textContent = 'Substats';
    var emptyStat = document.createElement('option');
    emptyStat.value = '';
    emptyStat.textContent = 'Substat auswählen';
    statSelect.append(emptyStat);
    stats.forEach(function (stat) { var option = document.createElement('option'); option.value = stat.value; option.textContent = stat.label; statSelect.append(option); });
    var selectedStatChips = document.createElement('div');
    selectedStatChips.className = 'preset-selected-stats';
    var addStat = button('Hinzufügen', function () {
        if (!statSelect.value)
            return;
        selectedStats.add(statSelect.value);
        renderStatChoices();
    });
    addStat.id = 'relic-preset-add-substat';
    addStat.disabled = true;
    statSelect.addEventListener('change', function () { addStat.disabled = !statSelect.value || selectedStats.has(statSelect.value); });
    var statPicker = document.createElement('div');
    statPicker.className = 'preset-stat-picker';
    statPicker.append(statSelect, addStat);
    statEditor.append(statCaption, statPicker, selectedStatChips);
    var statLabel = function (id) { var _a; return ((_a = stats.find(function (s) { return s.value === id; })) === null || _a === void 0 ? void 0 : _a.label) || "Nicht verf\u00FCgbar: Substat ".concat(id); };
    function renderStatChoices() {
        selectedStatChips.replaceChildren();
        selectedStats.forEach(function (id) {
            var text = statLabel(id).replace(/[+\-−]?x%\s*/g, '');
            var chip = button('', function () { selectedStats.delete(id); renderStatChoices(); });
            chip.append(bonusBadge(statLabel(id)), document.createTextNode(' ×'));
            chip.dataset.substat = id;
            chip.setAttribute('aria-label', "".concat(text, " entfernen"));
            selectedStatChips.append(chip);
        });
        Array.from(statSelect.options).forEach(function (option) { option.disabled = selectedStats.has(option.value); });
        statSelect.value = '';
        addStat.disabled = true;
    }
    function resetEditor() {
        var _a;
        editingId = null;
        name.value = '';
        type.value = '';
        selectedStats = new Set();
        heading.textContent = 'Neues Preset';
        (_a = type.querySelector('[data-unavailable]')) === null || _a === void 0 ? void 0 : _a.remove();
        renderStatChoices();
        mode.value = 'exact';
        type.disabled = false;
        shiny.checked = false;
        form.hidden = true;
        editorMessage.textContent = '';
        if (modal.open)
            modal.close();
    }
    function showEditor() {
        returnFocus = document.activeElement;
        form.hidden = false;
        modal.showModal();
        name.focus();
    }
    modal.addEventListener('cancel', function (event) { event.preventDefault(); resetEditor(); returnFocus === null || returnFocus === void 0 ? void 0 : returnFocus.focus(); });
    var saveButton = document.createElement('button');
    saveButton.type = 'submit';
    saveButton.textContent = 'Speichern';
    var editorActions = document.createElement('div');
    editorActions.className = 'preset-actions';
    editorActions.append(saveButton, button('Abbrechen', function () { resetEditor(); returnFocus === null || returnFocus === void 0 ? void 0 : returnFocus.focus(); }), button('Löschen', function () {
        if (!editingId)
            return;
        presets = presets.filter(function (p) { return p.id !== editingId; });
        resetEditor();
        persist();
        newButton.focus();
    }));
    form.append(heading, label('Name', name), label('Regel', mode), label('Typ / Hauptbonus', type), statEditor, checkboxLabel('Nur Shiny-Reliquien', shiny), editorActions, editorMessage);
    modal.append(form);
    var newButton = button('Neues Preset', function () { resetEditor(); message.textContent = ''; showEditor(); });
    newButton.id = 'relic-preset-new';
    panel.append(closeButton, toolbar, list, newButton, message);
    message.textContent = storageMessage;
    var highlight = function () {
        var marked = 0;
        grid.querySelectorAll('img[data-id]').forEach(function (image) {
            var relic = RelicSystem.getRelicById(image.dataset.id);
            var matching = relic ? presets.filter(function (preset) { return (0, relic_preset_model_1.matchesPreset)(relic, preset); }) : [];
            var tile = image.parentElement;
            tile.classList.toggle('relic-preset', matching.length > 0);
            if (matching.length) {
                tile.dataset.relicPresetNames = matching.map(function (p) { return p.name; }).join(' · ');
                marked++;
            }
            else
                delete tile.dataset.relicPresetNames;
        });
        count.textContent = "Markiert: ".concat(marked);
    };
    function persist() {
        try {
            localStorage.setItem(STORAGE_KEY, (0, relic_preset_model_1.writePresets)(presets, installed, color));
            message.textContent = '';
        }
        catch (_a) {
            message.textContent = 'Nur für diese Sitzung übernommen: Browser-Speicher ist nicht verfügbar.';
        }
        renderList();
        highlight();
    }
    function renderList() {
        list.replaceChildren();
        if (!presets.length) {
            var empty = document.createElement('p');
            empty.className = 'preset-empty';
            empty.textContent = 'Keine Presets.';
            list.append(empty);
        }
        var groups = [
            ['Kampf', presets.filter(function (p) { return p.id.startsWith('default:') && !p.allBonuses; })],
            ['Rohstoffe', presets.filter(function (p) { return p.id.startsWith('default:') && p.allBonuses; })],
            ['Eigene', presets.filter(function (p) { return !p.id.startsWith('default:'); })]
        ];
        groups.forEach(function (_a) {
            var _b = __read(_a, 2), group = _b[0], rules = _b[1];
            if (!rules.length)
                return;
            var groupTitle = document.createElement('strong');
            groupTitle.className = 'preset-group';
            groupTitle.textContent = group;
            list.append(groupTitle);
            rules.forEach(function (preset) {
                var _a;
                var card = document.createElement('section');
                card.className = 'preset-card';
                card.dataset.presetId = preset.id;
                card.title = preset.name;
                var enabled = document.createElement('input');
                enabled.type = 'checkbox';
                enabled.checked = preset.enabled;
                enabled.setAttribute('aria-label', "".concat(preset.name, ": aktiv"));
                enabled.addEventListener('change', function () {
                    var _a, _b;
                    preset.enabled = enabled.checked;
                    persist();
                    (_b = (_a = Array.from(list.querySelectorAll('.preset-card')).find(function (c) { return c.dataset.presetId === preset.id; })) === null || _a === void 0 ? void 0 : _a.querySelector('input')) === null || _b === void 0 ? void 0 : _b.focus();
                });
                var selection = checkboxLabel(preset.name, enabled);
                selection.querySelector('span').className = 'preset-name';
                card.append(selection);
                var summary = document.createElement('div');
                summary.className = 'preset-summary';
                var typeName = preset.type ? ((_a = types.find(function (t) { return t.value === preset.type; })) === null || _a === void 0 ? void 0 : _a.label) || "Nicht verf\u00FCgbar: ".concat(preset.type) : 'Beliebiger Typ';
                if (preset.allBonuses) {
                    summary.textContent = "".concat(preset.name, " \u00B7 3/3");
                    summary.title = preset.substats.map(statLabel).join(' / ');
                }
                else {
                    summary.append(bonusBadge(typeName, true, true), document.createTextNode('›'));
                    preset.substats.forEach(function (id) { return summary.append(bonusBadge(statLabel(id), false, true)); });
                }
                if (preset.shinyOnly) {
                    var mark = document.createElement('span');
                    mark.textContent = '✦';
                    mark.style.color = '#d32697';
                    mark.title = 'Nur Shiny';
                    summary.append(mark);
                }
                selection.append(summary);
                var edit = button('✎', function () {
                    resetEditor();
                    editingId = preset.id;
                    heading.textContent = 'Preset bearbeiten';
                    name.value = preset.name;
                    if (preset.type && !types.some(function (t) { return t.value === preset.type; })) {
                        addOption(preset.type, "Nicht verf\u00FCgbar: ".concat(preset.type));
                        type.lastElementChild.setAttribute('data-unavailable', '');
                    }
                    type.value = preset.type;
                    selectedStats = new Set(preset.substats);
                    mode.value = preset.allBonuses ? 'all' : 'exact';
                    type.disabled = !!preset.allBonuses;
                    shiny.checked = !!preset.shinyOnly;
                    renderStatChoices();
                    message.textContent = '';
                    showEditor();
                });
                edit.className = 'preset-edit';
                edit.setAttribute('aria-label', "".concat(preset.name, " bearbeiten"));
                edit.title = 'Bearbeiten';
                card.append(edit);
                list.append(card);
            });
        });
        var enabled = presets.filter(function (p) { return p.enabled; }).length;
        var title = enabled ? "Presets (".concat(enabled, ")") : 'Presets';
        trigger.textContent = title;
        dock.setTitle(title);
    }
    form.addEventListener('submit', function (event) {
        var _a;
        event.preventDefault();
        if (!name.value.trim()) {
            editorMessage.textContent = 'Bitte gib dem Preset einen Namen.';
            name.focus();
            return;
        }
        if (!type.value && !selectedStats.size) {
            editorMessage.textContent = 'Wähle mindestens einen Typ oder einen Substat.';
            return;
        }
        if ((type.value && !types.some(function (t) { return t.value === type.value; })) || Array.from(selectedStats).some(function (id) { return !stats.some(function (s) { return s.value === id; }); })) {
            editorMessage.textContent = 'Ein Typ oder Substat ist nicht mehr verfügbar. Bitte passe die Auswahl an.';
            return;
        }
        var previous = presets.find(function (p) { return p.id === editingId; });
        var preset = __assign(__assign({ id: editingId || crypto.randomUUID(), name: name.value.trim(), enabled: (_a = previous === null || previous === void 0 ? void 0 : previous.enabled) !== null && _a !== void 0 ? _a : true, type: type.value, substats: Array.from(selectedStats) }, (mode.value === 'all' ? { allBonuses: true } : {})), (shiny.checked ? { shinyOnly: true } : {}));
        if (previous)
            presets = presets.map(function (p) { return p.id === editingId ? preset : p; });
        else
            presets.push(preset);
        resetEditor();
        persist();
        newButton.focus();
    });
    new MutationObserver(highlight).observe(grid, { childList: true, subtree: true });
    resetEditor();
    renderList();
    highlight();
}
exports.installRelicPresets = installRelicPresets;


/***/ }),

/***/ 945:
/***/ (function(__unused_webpack_module, exports) {


var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.matchesRelic = exports.parseSearch = exports.normalize = exports.emptySearch = void 0;
var emptySearch = function () { return ({ query: '', qualities: [], types: [], substats: [], effects: [], targets: [], allSubstats: false, shiny: 'all' }); };
exports.emptySearch = emptySearch;
var normalize = function (text) { return text.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u'); };
exports.normalize = normalize;
var aliases = { off: 'angriff', def: 'verteidigung', kosten: 'kosten', speed: 'geschwindigkeit', rekrutierung: 'rekrutier', lk: 'leichte kavallerie', sk: 'schwere kavallerie', kata: 'katapult' };
function parseSearch(query, catalog) {
    var result = { qualities: [], types: [], shiny: 'all', terms: [], excluded: [], recognized: [] };
    var tokens = query.match(/-?"[^"]+"|\S+/g) || [];
    var _loop_1 = function (i) {
        var e_1, _a;
        var raw = tokens[i];
        var word = (0, exports.normalize)(raw.replace(/"/g, ''));
        if (['ohne', 'kein', 'keine', 'nicht'].includes(word) && ['shiny', 'shinys', 'pink'].includes((0, exports.normalize)(tokens[i + 1] || ''))) {
            result.shiny = 'no';
            result.recognized.push(raw + ' ' + tokens[++i]);
            return out_i_1 = i, "continue";
        }
        if (['shiny', 'shinys', 'pink', '-shiny'].includes(word)) {
            result.shiny = word === '-shiny' ? 'no' : 'yes';
            result.recognized.push(raw);
            return out_i_1 = i, "continue";
        }
        if (['nur', 'mit', 'und', 'oder', 'reliquien'].includes(word))
            return out_i_1 = i, "continue";
        var found = false;
        var _loop_2 = function (group) {
            var choice = catalog[group].find(function (c) { return (0, exports.normalize)(c.value) === word || (0, exports.normalize)(c.label) === word ||
                (group === 'qualities' && (0, exports.normalize)(c.label).replace(/e$/, '') === word.replace(/(?:en|er|es|e)$/, '')); });
            if (choice) {
                result[group].push(choice.value);
                result.recognized.push(raw);
                found = true;
                return "break";
            }
        };
        try {
            for (var _b = (e_1 = void 0, __values(['qualities', 'types'])), _c = _b.next(); !_c.done; _c = _b.next()) {
                var group = _c.value;
                var state_1 = _loop_2(group);
                if (state_1 === "break")
                    break;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (found)
            return out_i_1 = i, "continue";
        var exclude = word.startsWith('-');
        if (exclude)
            word = word.slice(1);
        (exclude ? result.excluded : result.terms).push(aliases[word] || word);
        out_i_1 = i;
    };
    var out_i_1;
    for (var i = 0; i < tokens.length; i++) {
        _loop_1(i);
        i = out_i_1;
    }
    return result;
}
exports.parseSearch = parseSearch;
function matchesRelic(relic, state, parsed) {
    var text = (0, exports.normalize)(__spreadArray([relic.name, relic.type, relic.main_stat.name], __read(relic.sub_stats.map(function (s) { return s.name; })), false).join(' '));
    var any = function (selected, value) { return !selected.length || selected.includes(value); };
    var shiny = relic.sub_stats.some(function (s) { return s.perfect === true; });
    var shinyMatch = function (mode) { return mode === 'all' || shiny === (mode === 'yes'); };
    var subMatch = function (id) { return relic.sub_stats.some(function (s) { return String(s.id) === id; }); };
    return any(state.qualities, relic.quality) && any(parsed.qualities, relic.quality) &&
        any(state.types, relic.type) && any(parsed.types, relic.type) && shinyMatch(state.shiny) && shinyMatch(parsed.shiny) &&
        (!state.substats.length || (state.allSubstats ? state.substats.every(subMatch) : state.substats.some(subMatch))) &&
        (!state.effects.length || state.effects.some(function (t) { return text.includes((0, exports.normalize)(t)); })) &&
        (!state.targets.length || state.targets.some(function (t) { return text.includes((0, exports.normalize)(t)); })) &&
        parsed.terms.every(function (t) { return text.includes(t); }) && !parsed.excluded.some(function (t) { return text.includes(t); });
}
exports.matchesRelic = matchesRelic;


/***/ }),

/***/ 421:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.installRelicSearch = void 0;
var docked_panels_1 = __webpack_require__(597);
var relic_sort_1 = __webpack_require__(973);
var relic_search_model_1 = __webpack_require__(945);
function installRelicSearch() {
    var container = document.getElementById('relics_container');
    if (!container || document.getElementById('relic-search') || typeof RelicSystem === 'undefined')
        return;
    var inventory = RelicSystem.Inventory;
    var options = function (id) { return Array.from(document.querySelectorAll("#".concat(id, " option")))
        .filter(function (o) { return o.value; }).map(function (o) { return ({ value: o.value, label: o.textContent || o.value }); }); };
    var catalog = { qualities: options('inventory_filter_quality'), types: options('inventory_filter_type') };
    var substats = options('inventory_filter_sub1');
    if (!catalog.types.length)
        return;
    var state = (0, relic_search_model_1.emptySearch)();
    var sorting = (0, relic_sort_1.defaultSort)();
    var sortFields = (0, relic_sort_1.relicSortFields)(catalog.types, substats);
    var parsedQuery = function () { return (0, relic_search_model_1.parseSearch)(state.query, catalog); };
    var total = 0;
    var style = document.createElement('style');
    style.textContent = "\n    #relics_container .ui-dropdown { display: none !important; }\n    #relic-search { margin: 0 0 10px; color: #412b13; }\n    #relic-search .search-line { display: flex; gap: 6px; }\n    #relic-search .sort-line { display: flex; align-items: center; gap: 5px; margin-top: 4px; font-size: 11px; white-space: nowrap; }\n    #relic-search .sort-line select { width: auto; max-width: 160px; height: 22px; padding: 0 3px; color: #412b13; background: #f4e4c2; border: 1px solid #b39a6b; font: inherit; }\n    #relic-search .sort-line button { height: 22px; min-width: 24px; padding: 0 5px; border-radius: 3px; }\n    #relic-search .sort-line button:disabled { opacity: .45; cursor: default; }\n    #relic-search input { flex: 1; min-width: 0; padding: 8px 10px; border: 1px solid #ab8955; border-radius: 6px; background: #fff6df; }\n    :is(#relic-search, #relic-filter-window) button:not(.relic-dock-handle) { cursor: pointer; font: inherit; color: inherit; border: 1px solid #b39a6b; border-radius: 12px; padding: 3px 9px; background: #f4e4c2; }\n    :is(#relic-search, #relic-filter-window) button:not(.relic-dock-handle)[aria-pressed=\"true\"] { background: #76502d; color: #fff4d9; border-color: #563716; }\n    :is(#relic-search, #relic-filter-window) button:not(.relic-dock-handle):focus-visible, #relic-search input:focus-visible { outline: 2px solid #915dac; outline-offset: 2px; }\n    #relic-filter-window .filter-groups { display: block; margin: 0; }\n    #relic-filter-window details { width: 100%; border-bottom: 1px solid #c8b58e; }\n    #relic-filter-window summary { cursor: pointer; font-weight: bold; padding: 3px 0; }\n    #relic-filter-window .choices { display: flex; flex-wrap: wrap; gap: 4px; max-height: 150px; overflow: auto; padding: 4px 2px; }\n    #relic-filter-window .active-filters { display: flex; flex-wrap: wrap; gap: 4px; margin: 5px 0; }\n    #relic-search .search-status { display: block; font-size: 12px; margin-top: 5px; }\n  ";
    document.head.appendChild(style);
    var root = document.createElement('section');
    root.id = 'relic-search';
    root.setAttribute('aria-label', 'Reliquien suchen und filtern');
    var line = document.createElement('div');
    line.className = 'search-line';
    var input = document.createElement('input');
    input.type = 'search';
    input.id = 'relic-search-input';
    input.setAttribute('aria-label', 'Reliquien suchen');
    input.placeholder = 'z. B. shiny katapult verteidigung';
    var button = function (label, action) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.addEventListener('click', action);
        return b;
    };
    var filterWindow = document.createElement('aside');
    filterWindow.id = 'relic-filter-window';
    filterWindow.setAttribute('aria-label', 'Inventarfilter');
    document.body.append(filterWindow);
    var dock = (0, docked_panels_1.addDockedPanel)(filterWindow, 'Filter');
    var trigger = button('Filter', function () { return setOpen(filterWindow.hidden); });
    trigger.id = 'relic-filter-trigger';
    trigger.setAttribute('aria-controls', filterWindow.id);
    function setOpen(open) {
        dock.setVisible(open);
        trigger.setAttribute('aria-expanded', String(open));
    }
    trigger.setAttribute('aria-expanded', 'true');
    line.append(input, trigger, button('Zurücksetzen', function () { state = (0, relic_search_model_1.emptySearch)(); sorting = (0, relic_sort_1.defaultSort)(); input.value = ''; apply(); }));
    var sortLine = document.createElement('div');
    sortLine.className = 'sort-line';
    var sortLabel = document.createElement('label');
    sortLabel.textContent = 'Sortieren:';
    sortLabel.htmlFor = 'relic-sort-field';
    var sortSelect = document.createElement('select');
    sortSelect.id = 'relic-sort-field';
    var substatSortGroup = document.createElement('optgroup');
    substatSortGroup.label = 'Substat-Stärke';
    sortFields.forEach(function (field) {
        var option = document.createElement('option');
        option.value = field.id;
        option.textContent = field.label;
        (field.id.startsWith('substat:') ? substatSortGroup : sortSelect).append(option);
    });
    sortSelect.append(substatSortGroup);
    var direction = button('↑', function () { sorting.descending = !sorting.descending; apply(); });
    direction.id = 'relic-sort-direction';
    sortSelect.addEventListener('change', function () {
        sorting.field = sortSelect.value;
        if (sorting.field === 'standard')
            sorting.descending = false;
        if (sorting.field.startsWith('substat:'))
            sorting.descending = true;
        apply();
    });
    sortLine.append(sortLabel, sortSelect, direction);
    var groups = document.createElement('div');
    groups.className = 'filter-groups';
    var active = document.createElement('div');
    active.className = 'active-filters';
    var status = document.createElement('output');
    status.className = 'search-status';
    status.setAttribute('aria-live', 'polite');
    root.append(line, sortLine, status);
    container.prepend(root);
    var closeButton = button('Schließen', function () { setOpen(false); trigger.focus(); });
    closeButton.className = 'relic-dock-close';
    closeButton.setAttribute('aria-label', 'Filterfenster schließen');
    filterWindow.append(closeButton, groups, active);
    var controls = [];
    var labels = new Map();
    var sections = [];
    var group = function (title, count) {
        var details = document.createElement('details');
        var summary = document.createElement('summary');
        summary.textContent = title;
        var choices = document.createElement('div');
        choices.className = 'choices';
        details.append(summary, choices);
        groups.append(details);
        sections.push({ summary: summary, title: title, count: count });
        return choices;
    };
    var addMulti = function (key, title, values) {
        var parent = group(title, function () { return new Set(__spreadArray(__spreadArray([], __read(state[key]), false), __read(((key === 'types' || key === 'qualities') ? parsedQuery()[key] : [])), false)).size; });
        values.forEach(function (choice) {
            labels.set(key + ':' + choice.value, choice.label);
            var b = button(choice.label, function () {
                state[key] = state[key].includes(choice.value) ? state[key].filter(function (v) { return v !== choice.value; }) : __spreadArray(__spreadArray([], __read(state[key]), false), [choice.value], false);
                apply();
            });
            b.dataset.filter = key;
            b.dataset.value = choice.value;
            parent.append(b);
            controls.push({ button: b, selected: function () { return state[key].includes(choice.value); } });
        });
        return parent;
    };
    addMulti('qualities', 'Qualität', catalog.qualities);
    addMulti('types', 'Typ', catalog.types);
    var props = ['Angriff', 'Verteidigung', 'Rekrutierungskosten', 'Geschwindigkeit', 'Produktion', 'Gebäudeschaden', 'Kapazität'];
    addMulti('effects', 'Eigenschaften', props.map(function (label) { return ({ value: label, label: label }); }));
    var targets = Array.from(new Set(substats.map(function (s) { return s.label.split(':')[0]; }).filter(function (s) { return !s.includes('%'); })));
    addMulti('targets', 'Einheiten & Gebäude', targets.map(function (label) { return ({ value: label, label: label }); }));
    var subs = addMulti('substats', 'Substats', substats);
    var mode = button('Alle gewählten Substats erforderlich', function () { state.allSubstats = !state.allSubstats; apply(); });
    subs.prepend(mode);
    controls.push({ button: mode, selected: function () { return state.allSubstats; } });
    var shinyGroup = group('Shiny', function () { return state.shiny !== 'all' || parsedQuery().shiny !== 'all' ? 1 : 0; });
    ['all', 'yes', 'no'].forEach(function (value, i) {
        var b = button(['Alle', 'Nur Shiny', 'Ohne Shiny'][i], function () { state.shiny = value; apply(); });
        shinyGroup.append(b);
        controls.push({ button: b, selected: function () { return state.shiny === value; } });
    });
    var renderControls = function () {
        var _a;
        sortSelect.value = sorting.field;
        sortSelect.title = ((_a = sortFields.find(function (f) { return f.id === sorting.field; })) === null || _a === void 0 ? void 0 : _a.label) || 'Standard';
        if (sorting.field.startsWith('substat:'))
            sortSelect.title += ' · Stärke in %; ohne diesen Substat zuletzt';
        direction.disabled = sorting.field === 'standard';
        direction.textContent = sorting.descending ? '↓' : '↑';
        direction.title = sorting.field === 'standard' ? 'Ursprüngliche Inventarreihenfolge' : (sorting.descending ? 'Absteigend – aufsteigend sortieren' : 'Aufsteigend – absteigend sortieren');
        direction.setAttribute('aria-label', direction.title);
        var parsed = parsedQuery();
        var count = 0;
        sections.forEach(function (section) {
            var n = section.count();
            count += n;
            section.summary.textContent = section.title + (n ? ' (' + n + ')' : '');
        });
        var title = count ? 'Filter (' + count + ')' : 'Filter';
        trigger.textContent = title;
        dock.setTitle(title);
        controls.forEach(function (c) { return c.button.setAttribute('aria-pressed', String(c.selected())); });
        active.replaceChildren();
        ['qualities', 'types', 'effects', 'targets', 'substats'].forEach(function (key) { return state[key].forEach(function (value) {
            active.append(button("".concat(labels.get(key + ':' + value), " \u00D7"), function () { state[key] = state[key].filter(function (v) { return v !== value; }); apply(); }));
        }); });
        if (state.shiny !== 'all')
            active.append(button("".concat(state.shiny === 'yes' ? 'Nur Shiny' : 'Ohne Shiny', " \u00D7"), function () { state.shiny = 'all'; apply(); }));
        parsed.recognized.forEach(function (term) { return active.append(button("Suche: ".concat(term, " \u00D7"), function () {
            state.query = state.query.replace(term, '').trim();
            input.value = state.query;
            apply();
        })); });
    };
    // Keep the game's eligibility rules (equipped, offered and slotted relics).
    // Our predicate replaces only the four native UI filters, before native grouping.
    var originalData = inventory.updateData;
    inventory.updateData = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        Object.keys(inventory.filters).forEach(function (key) { inventory.filters[key] = null; });
        originalData.apply(this, args);
        total = inventory.inventory_relics.length;
        var parsed = parsedQuery();
        inventory.inventory_relics = (0, relic_sort_1.sortRelics)(inventory.inventory_relics.filter(function (r) { return (0, relic_search_model_1.matchesRelic)(r, state, parsed); }), sorting, sortFields);
    };
    var originalUI = inventory.updateUI;
    inventory.updateUI = function () {
        inventory.page = Math.max(0, Math.min(inventory.page, inventory.getMaxPage()));
        originalUI.call(this);
        var count = inventory.inventory_relics.length;
        var stacks = inventory.getGroupedInventoryRelics().length;
        status.textContent = count ? "".concat(count, " von ").concat(total, " Reliquien \u00B7 ").concat(stacks, " Kacheln \u00B7 Seite ").concat(inventory.page + 1, "/").concat(inventory.getMaxPage() + 1) : 'Keine Treffer – ändere die Suche oder setze die Filter zurück.';
    };
    function apply() {
        var _a;
        inventory.page = 0;
        inventory.RelicsGridPanel.deselectRelic();
        (_a = document.getElementById('relic-hover-details')) === null || _a === void 0 ? void 0 : _a.setAttribute('hidden', '');
        inventory.updateData();
        renderControls();
        inventory.updateUI();
        window.dispatchEvent(new Event('resize'));
    }
    input.addEventListener('input', function () { state.query = input.value; apply(); });
    apply();
}
exports.installRelicSearch = installRelicSearch;


/***/ }),

/***/ 639:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.installRelicShinyHighlight = void 0;
var STYLE_ID = 'reliquiensrtipz-shiny-highlight';
function installRelicShinyHighlight() {
    var grid = document.getElementById('relics');
    if (!grid || document.getElementById(STYLE_ID))
        return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = "\n    #relics > div.relic-shiny > img {\n      outline: 3px solid #ff4fc3;\n      outline-offset: -3px;\n    }\n  ";
    document.head.appendChild(style);
    var highlight = function () {
        if (typeof RelicSystem === 'undefined')
            return;
        grid.querySelectorAll('img[data-id]').forEach(function (image) {
            var _a, _b, _c;
            var relic = RelicSystem.getRelicById(image.dataset.id);
            (_a = image.parentElement) === null || _a === void 0 ? void 0 : _a.classList.toggle('relic-shiny', (_c = (_b = relic === null || relic === void 0 ? void 0 : relic.sub_stats) === null || _b === void 0 ? void 0 : _b.some(function (stat) { return stat.perfect === true; })) !== null && _c !== void 0 ? _c : false);
        });
    };
    // The game replaces tiles on filtering, paging, resizing and slot selection.
    // Observe children only so our own class changes cannot retrigger the observer.
    new MutationObserver(highlight).observe(grid, { childList: true, subtree: true });
    highlight();
}
exports.installRelicShinyHighlight = installRelicShinyHighlight;


/***/ }),

/***/ 973:
/***/ (function(__unused_webpack_module, exports) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sortRelics = exports.relicSortFields = exports.substatStrength = exports.defaultSort = void 0;
var defaultSort = function () { return ({ field: 'standard', descending: false }); };
exports.defaultSort = defaultSort;
// The game only supplies formatted bonus text. Extract one unambiguous percentage
// and compare numbers; reductions use magnitude so -10% costs is stronger than -2%.
function substatStrength(name) {
    var values = name.match(/[+\-−]?\s*\d+(?:[.,]\d+)*\s*%/g);
    if ((values === null || values === void 0 ? void 0 : values.length) !== 1)
        return undefined;
    var number = values[0].replace(/[%\s+\-−]/g, '');
    var normalized = number.includes(',') ? number.replace(/\./g, '').replace(',', '.') : number;
    var value = Number(normalized);
    return Number.isFinite(value) ? value : undefined;
}
exports.substatStrength = substatStrength;
function relicSortFields(types, substats) {
    if (substats === void 0) { substats = []; }
    var typeNames = new Map(types.map(function (t) { return [t.value, t.label]; }));
    var qualities = ['shoddy', 'polished', 'refined', 'superior', 'renowned'];
    return __spreadArray([
        { id: 'standard', label: 'Standard' },
        { id: 'quality', label: 'Qualität', value: function (r) { var rank = qualities.indexOf(r.quality); return rank < 0 ? undefined : rank; } },
        { id: 'type', label: 'Typ', value: function (r) { return typeNames.get(r.type) || r.type; } },
        { id: 'range', label: 'Bereich', value: function (r) { return r.range; } },
        { id: 'shiny', label: 'Shiny-Substats', value: function (r) { return r.sub_stats.filter(function (s) { return s.perfect === true; }).length; } }
    ], __read(substats.map(function (stat) { return ({
        id: "substat:".concat(stat.value), label: stat.label.replace(/[+\-]?x%\s*/g, '').trim(),
        value: function (r) {
            var values = r.sub_stats.filter(function (s) { return String(s.id) === stat.value; })
                .map(function (s) { return substatStrength(s.name); }).filter(function (v) { return v !== undefined; });
            return values.length ? Math.max.apply(Math, __spreadArray([], __read(values), false)) : undefined;
        }
    }); })), false);
}
exports.relicSortFields = relicSortFields;
// Sort a copy; ties retain native order even when descending. Missing values stay last.
function sortRelics(items, state, fields) {
    var _a;
    var value = (_a = fields.find(function (f) { return f.id === state.field; })) === null || _a === void 0 ? void 0 : _a.value;
    if (!value)
        return items.slice();
    var collator = new Intl.Collator('de', { sensitivity: 'base' });
    var missing = function (v) { return v === undefined || (typeof v === 'number' && !Number.isFinite(v)); };
    return items.map(function (item, index) { return ({ item: item, index: index, key: value(item) }); }).sort(function (a, b) {
        if (missing(a.key) || missing(b.key))
            return Number(missing(a.key)) - Number(missing(b.key)) || a.index - b.index;
        var diff = typeof a.key === 'number' && typeof b.key === 'number'
            ? a.key - b.key : collator.compare(String(a.key), String(b.key));
        return (state.descending ? -diff : diff) || a.index - b.index;
    }).map(function (entry) { return entry.item; });
}
exports.sortRelics = sortRelics;


/***/ }),

/***/ 358:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.upgradePreviewMode = exports.parseRelicImage = void 0;
function parseRelicImage(src) {
    var _a;
    var filename = ((_a = src.split('/').pop()) === null || _a === void 0 ? void 0 : _a.split(/[?#]/)[0]) || '';
    var match = filename.match(/^(.+)_(shoddy|polished|refined|superior|renowned)(?:_[^.]+)?\.(?:webp|png|jpg)$/i);
    return match ? { type: match[1].toLowerCase(), quality: match[2].toLowerCase() } : null;
}
exports.parseRelicImage = parseRelicImage;
function upgradePreviewMode(slots) {
    if (slots.length !== 3 || slots.some(function (slot) { return !slot; }))
        return 'incomplete';
    var relics = slots;
    if (!relics.every(function (relic) { return relic.quality === relics[0].quality; }))
        return 'quality-mismatch';
    return relics.every(function (relic) { return relic.type === relics[0].type; }) ? 'retained' : 'random';
}
exports.upgradePreviewMode = upgradePreviewMode;


/***/ }),

/***/ 506:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.installUpgradePreview = void 0;
var upgrade_preview_model_1 = __webpack_require__(358);
function installUpgradePreview() {
    var panel = document.getElementById('upgrade_panel');
    var slots = document.getElementById('relics_to_upgrade');
    if (!panel || !slots || document.getElementById('relic-upgrade-preview'))
        return;
    var preview = document.createElement('section');
    preview.id = 'relic-upgrade-preview';
    preview.setAttribute('aria-label', 'Aufwertungsvorschau');
    preview.setAttribute('aria-live', 'polite');
    panel.appendChild(preview);
    var style = document.createElement('style');
    style.textContent = "\n    #relic-upgrade-preview { border-top: 1px solid #c8b58e; padding-top: 8px; min-width: 0; font-size: 11px; }\n    #relic-upgrade-preview > strong { display: block; color: #6e593b; margin-bottom: 5px; }\n    #relic-upgrade-preview > p { margin: 4px 0 7px; }\n    #relic-upgrade-preview .relic-details { margin: 0; width: 100%; min-width: 0; box-sizing: border-box; overflow-wrap: anywhere; }\n    #relic-upgrade-preview .header { display: flex; align-items: flex-start; gap: 4px; }\n    #relic-upgrade-preview .description { flex: 1; min-width: 0; }\n    #relic-upgrade-preview .image { flex: 0 0 40px; }\n    #relic-upgrade-preview .image img { width: 40px; height: 40px; }\n  ";
    document.head.appendChild(style);
    var firstSlotImage = function () { var _a; return ((_a = document.getElementById('relics_to_upgrade_0')) === null || _a === void 0 ? void 0 : _a.src) || ''; };
    var baseDetails = null;
    var baseImage = '';
    // Capture before the game's click handler clears the selected detail view.
    document.addEventListener('click', function (event) {
        var _a;
        if (!(event.target instanceof Element))
            return;
        if (event.target.closest('#relics_to_upgrade_remove_0')) {
            baseDetails = null;
            baseImage = '';
        }
        if (!event.target.closest('#add_relic_to_upgrade_panel_button') || (0, upgrade_preview_model_1.parseRelicImage)(firstSlotImage()))
            return;
        var details = document.querySelector('#selected_relic_details .relic-details');
        if (!details)
            return;
        baseImage = ((_a = details.querySelector('.image img')) === null || _a === void 0 ? void 0 : _a.src) || '';
        baseDetails = details.cloneNode(true);
        // Preserve pink/shiny colors even when the game's CSS is scoped to the selection.
        var originalStats = details.querySelectorAll('.sub_stats, .sub_stats *');
        var copiedStats = baseDetails.querySelectorAll('.sub_stats, .sub_stats *');
        originalStats.forEach(function (original, index) {
            copiedStats[index].style.color = getComputedStyle(original).color;
        });
        baseDetails.querySelectorAll('.buttons, script, iframe').forEach(function (node) { return node.remove(); });
        __spreadArray([baseDetails], __read(Array.from(baseDetails.querySelectorAll('*'))), false).forEach(function (node) {
            node.removeAttribute('id');
            Array.from(node.attributes).filter(function (attribute) { return attribute.name.startsWith('on'); })
                .forEach(function (attribute) { return node.removeAttribute(attribute.name); });
        });
    }, true);
    var render = function () {
        var images = [0, 1, 2].map(function (index) { var _a; return ((_a = document.getElementById("relics_to_upgrade_".concat(index))) === null || _a === void 0 ? void 0 : _a.src) || ''; });
        var relics = images.map(upgrade_preview_model_1.parseRelicImage);
        if (!relics[0] || images[0] !== baseImage)
            baseDetails = null;
        var mode = (0, upgrade_preview_model_1.upgradePreviewMode)(relics);
        var count = relics.filter(Boolean).length;
        preview.hidden = count === 0;
        if (!count) {
            preview.replaceChildren();
            return;
        }
        var heading = document.createElement('strong');
        preview.replaceChildren(heading);
        if (mode === 'incomplete') {
            heading.textContent = "Aufwertung \u00B7 ".concat(count, "/3");
        }
        else if (mode === 'quality-mismatch') {
            heading.textContent = 'Qualität passt nicht';
        }
        else if (mode === 'random') {
            heading.textContent = 'Zufallsaufwertung';
        }
        else {
            heading.textContent = 'Basiswerte · Substats bleiben';
        }
        if ((mode === 'retained' || mode === 'incomplete') && relics[0]) {
            if (baseDetails)
                preview.appendChild(baseDetails.cloneNode(true));
            else {
                var missing = document.createElement('p');
                missing.textContent = 'Basisdetails nicht verfügbar.';
                preview.appendChild(missing);
            }
        }
    };
    // Observe only game-owned slots, so rendering the preview cannot trigger itself.
    var observer = new MutationObserver(render);
    observer.observe(slots, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
    render();
}
exports.installUpgradePreview = installUpgradePreview;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
var __webpack_unused_export__;

__webpack_unused_export__ = ({ value: true });
var relic_grid_1 = __webpack_require__(817);
var docked_panels_1 = __webpack_require__(597);
var upgrade_preview_1 = __webpack_require__(506);
var relic_hover_details_1 = __webpack_require__(724);
var discovered_by_toggle_1 = __webpack_require__(868);
var relic_shiny_highlight_1 = __webpack_require__(639);
var relic_search_1 = __webpack_require__(421);
var relic_presets_1 = __webpack_require__(877);
var relic_onboarding_1 = __webpack_require__(288);
function main() {
    var api = typeof unsafeWindow != 'undefined' ? unsafeWindow.ScriptAPI : window.ScriptAPI;
    api.register('reliquienUI', true, 'TheHebel97', 'support-nur-im-forum@die-staemme.de');
    (0, relic_grid_1.installRelicGridLayout)();
    (0, docked_panels_1.installDockedPanels)();
    (0, upgrade_preview_1.installUpgradePreview)();
    (0, relic_hover_details_1.installRelicHoverDetails)();
    (0, discovered_by_toggle_1.installDiscoveredByToggle)();
    (0, relic_shiny_highlight_1.installRelicShinyHighlight)();
    (0, relic_search_1.installRelicSearch)();
    (0, relic_presets_1.installRelicPresets)();
    (0, relic_onboarding_1.installRelicOnboarding)();
    console.info('[reliquiensrtipz] Userscript geladen.');
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main, { once: true });
}
else {
    main();
}

})();

/******/ })()
;