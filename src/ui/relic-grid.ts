import { relicGridCapacity } from './relic-grid-layout';

const STYLE_ID = 'reliquiensrtipz-relic-grid';

interface InventoryPagination {
  page: number;
  relics_per_page: number;
  getMaxPage(): number;
  updateUI(): void;
  RelicsGridPanel: { deselectRelic(): void };
}

// The game exposes a global lexical binding, not a window property.
declare const RelicSystem: { Inventory: InventoryPagination } | undefined;

// CSS also applies when the game replaces relic tiles after filtering/paging.
export function installRelicGridLayout(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #page_inventory { min-width: 0; }
    #page_inventory > #relics_container {
      width: 100%;
      max-width: none;
      min-width: 0;
      flex: 1 1 100%;
      box-sizing: border-box;
    }
    #relics_container .relics-grid-row { width: 100%; min-width: 0; }
    .relics-grid-row > #relics {
      display: grid;
      grid-template-columns: repeat(var(--relic-grid-columns, 10), minmax(0, 1fr));
      flex: 1 1 0;
      width: 0;
      align-content: start;
      gap: 2px;
      min-width: 0;
      height: auto;
      padding: 2px;
      box-sizing: border-box;
    }

    .relics-grid-row > #relics > div {
      width: auto;
      min-width: 0;
      height: auto;
      aspect-ratio: 1;
      margin: 0;
      box-sizing: border-box;
    }

    .relics-grid-row > #relics > div > img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  `;
  document.head.appendChild(style);

  const grid = document.getElementById('relics');
  if (!grid) return;
  let pending = false;
  const resize = (): void => {
    pending = false;
    const inventory = typeof RelicSystem === 'undefined' ? undefined : RelicSystem.Inventory;
    if (!inventory) return;
    const css = getComputedStyle(grid);
    const width = grid.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight);
    if (width <= 0) return;
    // Reserve room below the grid for the page footer; keep at least one row.
    const availableHeight = window.innerHeight - Math.max(57, grid.getBoundingClientRect().top) - 40;
    const { columns, rows, pageSize } = relicGridCapacity(width, availableHeight);
    grid.style.setProperty('--relic-grid-columns', String(columns));
    grid.dataset.rows = String(rows);
    if (inventory.relics_per_page === pageSize) return;
    const firstItem = inventory.page * inventory.relics_per_page;
    inventory.relics_per_page = pageSize;
    inventory.page = Math.min(inventory.getMaxPage(), Math.floor(firstItem / pageSize));
    inventory.RelicsGridPanel.deselectRelic();
    document.getElementById('relic-hover-details')?.setAttribute('hidden', '');
    inventory.updateUI();
  };
  const scheduleResize = (): void => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(resize);
  };
  new ResizeObserver(scheduleResize).observe(grid);
  window.addEventListener('resize', scheduleResize);
  scheduleResize();
}
