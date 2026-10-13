import { addDockedPanel } from './docked-panels';
import { cloneRelicDetails, isRelicActionDisabled } from './relic-details-dom';

export function createRelicEquipPanel(
  grid: HTMLElement, selectedDetails: HTMLElement, selectNative: (tile: HTMLElement) => boolean, closeHover: () => void
): { select(tile: HTMLElement): void } {
  const panel = document.createElement('aside'); panel.id = 'relic-equip-window'; panel.hidden = true;
  panel.setAttribute('aria-label', 'Reliquie ausrüsten'); document.body.append(panel);
  const style = document.createElement('style');
  style.textContent = `
    #relic-equip-window .relic-details { width: 100%; min-width: 0; margin: 0; box-sizing: border-box; overflow-wrap: anywhere; }
    #relic-equip-window .header { display: flex; gap: 5px; }
    #relic-equip-window .description { flex: 1; min-width: 0; }
    #relic-equip-window .image { flex: 0 0 48px; }
    #relic-equip-window .image img { width: 48px; height: 48px; object-fit: contain; }
    #relic-equip-window .buttons { display: flex; justify-content: center; }
    #relic-equip-window .relic-dock-close { cursor: pointer; font-size: 11px; }
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
