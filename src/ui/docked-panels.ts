import { arrangeDock, balanceDockSides, dockHeightLimits, DOCK_GAP, DOCK_MARGIN } from './dock-layout';

const STYLE_ID = 'reliquiensrtipz-docked-panels-style';
const STORAGE_KEY = 'reliquiensrtipz:docked-panels';
const PANEL_WIDTH = 220;
const HEADER_HEIGHT = 57;
type Side = 'left' | 'right';
type Panel = { element: HTMLElement; side: Side; top: number; minHeight: number };
export interface DockController { setVisible(visible: boolean): void; setTitle(title: string): void }
let registerPanel: ((element: HTMLElement, label: string, top: number, minHeight?: number) => DockController) | undefined;
export function addDockedPanel(element: HTMLElement, label: string, top = 57, minHeight = 0): DockController {
  installDockedPanels();
  return registerPanel!(element, label, top, minHeight);
}

export function installDockedPanels(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .inventory-description { display: none !important; }
    :is(#village_relic, #upgrade_panel, #relic-filter-window, #relic-preset-window, #relic-equip-window).relic-dock {
      position: fixed;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
      width: var(--relic-dock-width, ${PANEL_WIDTH}px);
      max-width: 100vw;
      height: auto;
      min-width: 0;
      min-height: 0;
      margin: 0;
      padding: 7px;
      box-sizing: border-box;
      overflow: auto;
      scrollbar-width: none;
      background: #f1e3c3;
      border: 1px solid #a78c61;
      border-radius: 9px;
      box-shadow: 0 2px 5px #0002;
    }
    .relic-dock[hidden] { display: none !important; }
    .relic-dock::-webkit-scrollbar, .relic-dock .choices::-webkit-scrollbar { display: none; }
    .relic-dock .choices { scrollbar-width: none; }
    .relic-dock .relic-dock-close { position: absolute; top: 7px; right: 7px; z-index: 2; }
    :is(#relic-filter-window, #relic-preset-window, #relic-equip-window) .relic-dock-handle { padding-right: 76px; }
    :is(#village_relic, #upgrade_panel, #relic-filter-window, #relic-preset-window, #relic-equip-window).relic-dock-left { border-radius: 0 9px 9px 0; }
    :is(#village_relic, #upgrade_panel, #relic-filter-window, #relic-preset-window, #relic-equip-window).relic-dock-right { border-radius: 9px 0 0 9px; }
    .relic-dock > * { flex-shrink: 0; }
    #village_relic.relic-dock > div { width: 100%; min-width: 0; margin: 0; }
    #village_relic.relic-dock > div:first-of-type { text-align: center; }
    #village_relic.relic-dock #village_relic_image { width: 64px; height: 64px; object-fit: contain; }
    #village_relic.relic-dock .village-details-container,
    #village_relic.relic-dock .relic-details { width: 100%; min-width: 0; margin: 0; box-sizing: border-box; overflow-wrap: anywhere; }
    #upgrade_panel.relic-dock #relics_to_upgrade {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      width: 100%;
      margin: 0;
    }
    #upgrade_panel.relic-dock #relics_to_upgrade > div {
      position: relative;
      width: 58px;
      height: 58px;
      margin: 0;
      flex: 0 0 58px;
    }
    #upgrade_panel.relic-dock #relics_to_upgrade img { width: 100%; height: 100%; object-fit: contain; }
    #upgrade_panel.relic-dock #upgrade_relic_button { align-self: center; }
    :is(#village_relic, #upgrade_panel, #relic-filter-window, #relic-preset-window, #relic-equip-window).relic-dock .relic-dock-handle {
      position: sticky;
      top: 0;
      z-index: 1;
      width: 100%;
      padding: 4px 2px 6px;
      border: 0;
      border-bottom: 1px solid #c8b58e;
      border-radius: 0;
      background: #f1e3c3;
      color: #6e593b;
      font: 11px Verdana, sans-serif;
      text-align: left;
      cursor: ns-resize;
      touch-action: none;
      user-select: none;
    }
  `;
  document.head.appendChild(style);

  let saved: Record<string, { side: Side; top: number }> = {};
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {}; } catch { /* Optional storage. */ }
  const panels: Panel[] = [];
  const observer = new ResizeObserver(() => layout());
  const contentObserver = new MutationObserver(records => {
    const changed = panels.filter(panel => records.some(record => panel.element.contains(record.target)));
    layout(changed.length === 1 ? changed[0].element : undefined);
  });
  registerPanel = (element, label, top, minHeight = 0) => {
    const id = element.id;
    const state = saved[id];
    const panel: Panel = {
      element,
      minHeight,
      side: state?.side === 'left' ? 'left' : 'right',
      top: typeof state?.top === 'number' && Number.isFinite(state.top) ? state.top : top
    };
    panels.push(panel);
    element.classList.add('relic-dock');
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'relic-dock-handle';
    handle.textContent = `⠿ ${label}`;
    handle.title = 'Vertikal ziehen · ab 40 % Bildschirmbreite zur anderen Seite wechseln';
    handle.setAttribute('aria-label', `${label}: am Bildschirmrand verschieben`);
    element.prepend(handle);

    let drag: { id: number; offsetY: number; startSide: Side } | null = null;
    handle.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      drag = { id: event.pointerId, offsetY: event.clientY - element.getBoundingClientRect().top, startSide: panel.side };
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    handle.addEventListener('pointermove', event => {
      if (drag?.id !== event.pointerId) return;
      // Anchor the threshold to the starting side to avoid flickering around the middle.
      panel.side = drag.startSide === 'left'
        ? (event.clientX >= window.innerWidth * 0.4 ? 'right' : 'left')
        : (event.clientX <= window.innerWidth * 0.6 ? 'left' : 'right');
      panel.top = Math.max(HEADER_HEIGHT, event.clientY - drag.offsetY);
      layout(element);
    });
    const endDrag = (): void => {
      if (!drag) return;
      drag = null;
      save();
    };
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
    handle.addEventListener('lostpointercapture', endDrag);
    handle.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'ArrowLeft') panel.side = 'left';
      if (event.key === 'ArrowRight') panel.side = 'right';
      if (event.key === 'ArrowUp') panel.top -= event.shiftKey ? 1 : 10;
      if (event.key === 'ArrowDown') panel.top += event.shiftKey ? 1 : 10;
      layout(element);
      save();
    });
    observer.observe(element);
    contentObserver.observe(element, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'open'] });
    layout(element);
    return {
      setVisible(visible) { element.hidden = !visible; layout(visible ? element : undefined); },
      setTitle(title) { handle.textContent = `⠿ ${title}`; handle.setAttribute('aria-label', `${title}: am Bildschirmrand verschieben`); }
    };
  };

  function save(): void {
    const positions: Record<string, { side: Side; top: number }> = {};
    panels.forEach(panel => { positions[panel.element.id] = { side: panel.side, top: panel.top }; });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(positions)); } catch { /* Optional storage. */ }
  }

  function layout(preferred?: HTMLElement): void {
    const visiblePanels = panels.filter(p => !p.element.hidden);
    const naturalHeight = (panel: Panel): number => Math.max(panel.minHeight, panel.element.scrollHeight + panel.element.offsetHeight - panel.element.clientHeight);
    const widest = Math.max(0, ...visiblePanels.map(panel => panel.element.getBoundingClientRect().width));
    let sideChanged = false;
    if (window.innerWidth >= widest * 2 + DOCK_MARGIN * 2 + DOCK_GAP) {
      const sides = balanceDockSides(visiblePanels.map(panel => ({ side: panel.side, height: naturalHeight(panel) })),
        window.innerHeight - HEADER_HEIGHT, visiblePanels.findIndex(panel => panel.element === preferred));
      visiblePanels.forEach((panel, index) => {
        if (panel.side !== sides[index]) { panel.side = sides[index]; sideChanged = true; }
      });
    }
    const left = visiblePanels.filter(p => p.side === 'left');
    const right = visiblePanels.filter(p => p.side === 'right');
    const width = (group: Panel[]): number => Math.max(0, ...group.map(p => p.element.getBoundingClientRect().width));
    // Different panel widths still share a lane when the two edges would overlap.
    const groups = window.innerWidth < width(left) + width(right) + DOCK_MARGIN * 2 + DOCK_GAP
      ? [visiblePanels] : [left, right];
    groups.forEach(group => {
      if (!group.length) return;
      const available = window.innerHeight - HEADER_HEIGHT - DOCK_GAP * (group.length - 1);
      const limits = dockHeightLimits(group.map(naturalHeight), available);
      group.forEach((panel, index) => {
        panel.element.style.maxHeight = `${limits[index]}px`;
        panel.element.style.minHeight = `${Math.min(panel.minHeight, limits[index])}px`;
        panel.element.style.left = panel.side === 'left' ? '0' : 'auto';
        panel.element.style.right = panel.side === 'right' ? '0' : 'auto';
        panel.element.classList.toggle('relic-dock-left', panel.side === 'left');
        panel.element.classList.toggle('relic-dock-right', panel.side === 'right');
      });
      const positions = arrangeDock(group.map(panel => ({
        top: panel.top, height: panel.element.getBoundingClientRect().height
      })), window.innerHeight, HEADER_HEIGHT);
      group.forEach((panel, index) => {
        panel.top = positions[index];
        panel.element.style.top = `${panel.top}px`;
      });
    });
    if (sideChanged) save();
  }

  for (const [id, label, top] of [
    ['village_relic', 'Dorf-Reliquie', 96], ['upgrade_panel', 'Aufwerten', 490]
  ] as const) {
    const element = document.getElementById(id);
    if (element) registerPanel(element, label, top);
  }
  layout();
  window.addEventListener('resize', () => { layout(); save(); });
  // Equipping/selecting relics can change panel height without a page reload.
}
