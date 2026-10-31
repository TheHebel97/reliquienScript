import { cloneRelicDetails, isRelicActionDisabled } from './relic-details-dom';
import { createRelicEquipPanel } from './relic-equip-panel';
import { onRelicPageDispose, ownRelicNode, relicPageSignal } from './relic-page-scope';

const STYLE_ID = 'reliquiensrtipz-relic-hover-details-style';
const TOOLTIP_ID = 'relic-hover-details';

export function installRelicHoverDetails(): void {
  const grid = document.getElementById('relics');
  const selectedDetails = document.getElementById('selected_relic_details');
  if (!grid || !selectedDetails || document.getElementById(TOOLTIP_ID)) return;

  const style = ownRelicNode(document.createElement('style'));
  style.id = STYLE_ID;
  style.textContent = `
    #selected_relic_details { display: none !important; }
    #${TOOLTIP_ID} {
      position: fixed;
      z-index: 1001;
      width: 245px;
      max-width: calc(100vw - 16px);
      max-height: calc(100vh - 73px);
      padding: 8px;
      box-sizing: border-box;
      overflow: auto;
      pointer-events: none;
      background: #f1e3c3;
      border: 1px solid #a78c61;
      border-radius: 7px;
      box-shadow: 0 3px 10px #0004;
      color: #24190d;
      font-size: 12px;
    }
    #${TOOLTIP_ID}[hidden] { display: none; }
    #${TOOLTIP_ID} .relic-details { width: 100%; min-width: 0; margin: 0; box-sizing: border-box; overflow-wrap: anywhere; }
    #${TOOLTIP_ID} .header { display: flex; align-items: flex-start; gap: 6px; }
    #${TOOLTIP_ID} .description { flex: 1; min-width: 0; }
    #${TOOLTIP_ID} .image { flex: 0 0 56px; }
    #${TOOLTIP_ID} .image img { display: block; width: 56px; height: 56px; object-fit: contain; }
  `;
  document.head.appendChild(style);

  const tooltip = ownRelicNode(document.createElement('aside'));
  tooltip.id = TOOLTIP_ID;
  tooltip.hidden = true;
  tooltip.setAttribute('aria-live', 'polite');
  document.body.appendChild(tooltip);

  const detailContent = document.createElement('div');
  tooltip.append(detailContent);

  let hoveredId: string | null = null;
  let activeTile: HTMLElement | null = null;
  let allowingGameTileClick = false;
  let renderedDetails = '';

  const close = (): void => {
    tooltip.hidden = true;
    hoveredId = null;
    activeTile = null;
  };
  const contains = (element: HTMLElement, target: EventTarget | null): boolean =>
    target instanceof Node && element.contains(target);
  const position = (tile: HTMLElement): void => {
    const rect = tile.getBoundingClientRect();
    const width = tooltip.getBoundingClientRect().width;
    const height = tooltip.getBoundingClientRect().height;
    // The preview may overlap neighbours, but never intercepts their pointer events.
    const side = rect.right + width <= window.innerWidth - 8 ? rect.right : rect.left - width;
    const left = Math.max(8, Math.min(side, window.innerWidth - width - 8));
    const top = Math.max(57, Math.min(rect.top, window.innerHeight - height - 8));
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  };
  const captureDetails = (tile: HTMLElement): void => {
    const id = tile.querySelector<HTMLImageElement>('img[data-id]')?.dataset.id;
    const details = selectedDetails.querySelector<HTMLElement>('.relic-details');
    if (!grid.contains(tile) || id !== hoveredId || !details?.textContent?.trim() || !tile.classList.contains('relic-selected')) {
      close();
      return;
    }
    const clone = cloneRelicDetails(details);
    if (clone.outerHTML !== renderedDetails) {
      renderedDetails = clone.outerHTML;
      detailContent.replaceChildren(clone);
    }
    tooltip.hidden = false;
    position(tile);
  };
  const selectNative = (tile: HTMLElement): boolean => {
    const image = tile.querySelector<HTMLImageElement>('img[data-id]');
    if (!image || !grid.contains(tile)) return false;
    if (!tile.classList.contains('relic-selected')) {
      allowingGameTileClick = true;
      try {
        // The game's native listener is attached to IMG, not its wrapping DIV.
        image.click();
      } finally {
        allowingGameTileClick = false;
      }
    }
    return tile.classList.contains('relic-selected');
  };
  const selectForDetails = (tile: HTMLElement): void => {
    activeTile = tile; hoveredId = tile.querySelector<HTMLImageElement>('img[data-id]')?.dataset.id || null;
    if (!selectNative(tile)) { close(); return; }
    captureDetails(tile);
  };
  const equipPanel = createRelicEquipPanel(grid, selectedDetails, selectNative, close);
  grid.addEventListener('contextmenu', event => {
    const tile = (event.target as Element).closest<HTMLElement>('#relics > div');
    if (!tile?.querySelector('img[data-id]')) return;
    event.preventDefault(); event.stopImmediatePropagation(); close(); equipPanel.select(tile);
  }, true);

  grid.addEventListener('pointerover', event => {
    const tile = (event.target as Element).closest<HTMLElement>('#relics > div');
    if (!tile || contains(tile, event.relatedTarget)) return;
    // The game creates details only after selecting a tile. Hover intentionally selects it.
    selectForDetails(tile);
  });
  grid.addEventListener('pointerout', event => {
    const tile = (event.target as Element).closest<HTMLElement>('#relics > div');
    if (!tile || contains(tile, event.relatedTarget)) return;
    close();
  });
  const signal = relicPageSignal();
  window.addEventListener('blur', close, { signal });
  window.addEventListener('resize', close, { signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) close(); }, { signal });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); }, { signal });
  document.addEventListener('scroll', event => {
    if (!contains(tooltip, event.target)) close();
  }, { capture: true, signal });

  // Follow native detail/eligibility changes without retaining stale relic snapshots.
  const detailObserver = new MutationObserver(() => {
    if (activeTile) captureDetails(activeTile);
  });
  detailObserver.observe(selectedDetails, { childList: true, subtree: true, characterData: true, attributes: true });
  const gridObserver = new MutationObserver(() => {
    if (activeTile && (!grid.contains(activeTile) || activeTile.querySelector<HTMLImageElement>('img[data-id]')?.dataset.id !== hoveredId)) close();
  });
  gridObserver.observe(grid, { childList: true, subtree: true });
  onRelicPageDispose(() => { detailObserver.disconnect(); gridObserver.disconnect(); });
  grid.addEventListener('click', event => {
    const tile = (event.target as Element).closest<HTMLElement>('#relics > div');
    if (!tile || (event as MouseEvent).button !== 0) return;
    if (allowingGameTileClick) return;

    // A normal click adds through the game's own detail action, which fills the next free slot.
    event.preventDefault();
    event.stopImmediatePropagation();
    selectForDetails(tile);
    if (tile.classList.contains('relic-selected')) {
      const addButton = document.getElementById('add_relic_to_upgrade_panel_button') as HTMLButtonElement | null;
      close();
      if (addButton && !isRelicActionDisabled(addButton)) addButton.click();
    }
  }, true);
}
