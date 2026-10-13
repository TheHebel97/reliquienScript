import { addDockedPanel } from './docked-panels';
import { cloneRelicDetails, isRelicActionDisabled } from './relic-details-dom';

export function createRelicEquipPanel(
  grid: HTMLElement, selectedDetails: HTMLElement, selectNative: (tile: HTMLElement) => boolean, closeHover: () => void
): { select(tile: HTMLElement): void } {
  const panel = document.createElement('aside'); panel.id = 'relic-equip-window'; panel.hidden = true;
  panel.setAttribute('aria-label', 'Reliquie ausrüsten'); document.body.append(panel);
  const style = document.createElement('style');
  style.textContent = `
    #relic-equip-window { color: #412b13; font: 12px/1.4 Verdana, sans-serif; }
    #relic-equip-window .relic-details { width: 100%; min-width: 0; margin: 0; padding: 0; border: 0; background: transparent; box-sizing: border-box; overflow-wrap: anywhere; }
    #relic-equip-window .relic-details .header { display: grid; grid-template-columns: minmax(0, 1fr) 44px; gap: 6px; height: auto; min-height: 0; padding: 0; margin: 0; border: 0; background: transparent; }
    #relic-equip-window .description { display: contents; }
    #relic-equip-window .description strong { grid-column: 1; grid-row: 1; align-self: center; font-size: 12px; line-height: 1.3; }
    #relic-equip-window .description p { grid-column: 1 / -1; grid-row: 2; margin: 0; font-size: 12px; line-height: 1.4; }
    #relic-equip-window .image { grid-column: 2; grid-row: 1; width: 44px; height: 44px; margin: 0; padding: 0; }
    #relic-equip-window .image img { display: block; width: 44px; height: 44px; object-fit: contain; }
    #relic-equip-window .relic-details .body { height: auto; min-height: 0; margin: 7px 0 0; padding: 7px 0 0; border: 0; border-top: 1px solid #c8b58e; background: transparent; font-size: 11px; line-height: 1.4; }
    #relic-equip-window .sub_stats { display: grid; gap: 5px; margin: 0 0 7px; padding: 0; }
    #relic-equip-window .sub_stat { padding: 0; margin: 0; }
    #relic-equip-window :is(.range,.discovered_by) { margin: 0; padding: 0; color: #6e593b; font-size: 10px; line-height: 1.4; }
    #relic-equip-window .discovered_by a { color: inherit; font-weight: normal; }
    #relic-equip-window .buttons { display: flex; justify-content: center; margin: 2px 0 0; }
    #relic-equip-window .buttons button { font: inherit; font-weight: bold; padding: 4px 10px; border: 1px solid #563716; border-radius: 6px; background: #76502d; color: #fff4d9; text-shadow: none; box-shadow: none; cursor: pointer; }
    #relic-equip-window .buttons button:is(:disabled,.btn-disabled) { opacity: .55; cursor: default; }
    #relic-equip-window .relic-dock-close { cursor: pointer; font: 11px Verdana, sans-serif; padding: 3px 7px; border: 1px solid #b39a6b; border-radius: 6px; background: #f4e4c2; color: inherit; }
    #relics > div.relic-equip-selected > img { box-shadow: inset 0 0 0 1px #24190d; }
  `;
  document.head.append(style);
  const dock = addDockedPanel(panel, 'Ausrüsten');
  let pinnedId: string | null = null;
  let rendered = '';
  const content = document.createElement('div');
  const button = document.createElement('button'); button.id = 'relic-equip-button'; button.type = 'button'; button.className = 'btn';
  const actions = document.createElement('div'); actions.className = 'buttons'; actions.append(button);
  const closeButton = document.createElement('button'); closeButton.type = 'button'; closeButton.className = 'relic-dock-close';
  closeButton.textContent = 'Schließen'; closeButton.setAttribute('aria-label', 'Ausrüstfenster schließen');
  panel.append(closeButton, content, actions);
  const findTile = (): HTMLElement | null => {
    const image = Array.from(grid.querySelectorAll<HTMLImageElement>('img[data-id]')).find(img => img.dataset.id === pinnedId);
    return image?.parentElement || null;
  };
  const markSelection = (): void => {
    grid.querySelectorAll<HTMLElement>(':scope > div').forEach(tile => {
      tile.classList.toggle('relic-equip-selected', !!pinnedId && tile.querySelector<HTMLImageElement>('img[data-id]')?.dataset.id === pinnedId);
    });
  };
  const close = (): void => { pinnedId = null; dock.setVisible(false); button.disabled = true; markSelection(); };
  closeButton.addEventListener('click', close);
  const render = (): boolean => {
    const tile = findTile();
    if (!tile || !tile.classList.contains('relic-selected')) return false;
    const details = selectedDetails.querySelector<HTMLElement>('.relic-details');
    if (!details?.textContent?.trim()) { button.disabled = true; return false; }
    const clone = cloneRelicDetails(details);
    if (clone.outerHTML !== rendered) { rendered = clone.outerHTML; content.replaceChildren(clone); }
    const native = selectedDetails.querySelector<HTMLButtonElement>('#equip_button');
    button.disabled = !native || isRelicActionDisabled(native);
    button.hidden = !native; button.className = native?.className || 'btn'; button.textContent = native?.textContent || 'Ausrüsten';
    return true;
  };
  button.addEventListener('click', () => {
    if (!pinnedId || panel.hidden) return;
    const tile = findTile();
    if (!tile) { close(); return; }
    closeHover();
    // Hover may have changed native selection. Restore the exact right-clicked relic first.
    if (!selectNative(tile) || !render()) { close(); return; }
    const native = selectedDetails.querySelector<HTMLButtonElement>('#equip_button');
    if (!native || isRelicActionDisabled(native)) return;
    close(); native.click(); // Keep the game's confirmation, cooldown and requests.
  });
  new MutationObserver(() => {
    if (!pinnedId) return;
    if (!findTile()) close(); else render();
  }).observe(selectedDetails, { childList: true, subtree: true, attributes: true, characterData: true });
  new MutationObserver(() => {
    if (!pinnedId) return;
    if (!findTile()) close(); else { markSelection(); render(); }
  }).observe(grid, { childList: true, subtree: true });
  return { select(tile) {
    const id = tile.querySelector<HTMLImageElement>('img[data-id]')?.dataset.id;
    if (!id || !grid.contains(tile)) return;
    if (!selectNative(tile)) { close(); return; }
    pinnedId = id;
    if (!render()) { close(); return; }
    markSelection(); dock.setVisible(true);
  } };
}
