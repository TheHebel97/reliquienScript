const STYLE_ID = 'reliquiensrtipz-shiny-highlight';

declare const RelicSystem: {
  getRelicById(id: string): { sub_stats?: Array<{ perfect?: boolean }> } | undefined;
} | undefined;

export function installRelicShinyHighlight(): void {
  const grid = document.getElementById('relics');
  if (!grid || document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    #relics > div.relic-shiny > img {
      outline: 3px solid #ff4fc3;
      outline-offset: -3px;
    }
  `;
  document.head.appendChild(style);

  const highlight = (): void => {
    if (typeof RelicSystem === 'undefined') return;
    grid.querySelectorAll<HTMLImageElement>('img[data-id]').forEach(image => {
      const relic = RelicSystem.getRelicById(image.dataset.id!);
      image.parentElement?.classList.toggle('relic-shiny',
        relic?.sub_stats?.some(stat => stat.perfect === true) ?? false);
    });
  };
  // The game replaces tiles on filtering, paging, resizing and slot selection.
  // Observe children only so our own class changes cannot retrigger the observer.
  new MutationObserver(highlight).observe(grid, { childList: true, subtree: true });
  highlight();
}
