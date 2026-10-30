import { onRelicPageDispose, ownRelicNode } from './relic-page-scope';

const STYLE_ID = 'reliquiensrtipz-shiny-highlight';
const FILTER_ID = 'reliquien-shiny-rainbow';

declare const RelicSystem: {
  getRelicById(id: string): { sub_stats?: Array<{ perfect?: boolean }> } | undefined;
} | undefined;

export function installRelicShinyHighlight(): void {
  const grid = document.getElementById('relics');
  if (!grid || document.getElementById(STYLE_ID)) return;

  // Shade the original pixels rather than covering the item with a rectangle.
  // The blend keeps its lighting and details; the soft mask preserves the edges
  // of the native quality background (the game images are opaque WebP files).
  const rainbow = `<svg xmlns="http://www.w3.org/2000/svg" width="184" height="184" viewBox="0 0 184 184">
    <defs>
      <linearGradient id="rainbow" x1=".2" y1=".2" x2=".8" y2=".8" gradientUnits="objectBoundingBox">
        <stop stop-color="#ff466e"/><stop offset=".2" stop-color="#ffb43b"/>
        <stop offset=".38" stop-color="#d8f34b"/><stop offset=".55" stop-color="#42e6ae"/>
        <stop offset=".73" stop-color="#459aff"/><stop offset="1" stop-color="#e769ff"/>
      </linearGradient>
      <radialGradient id="focus"><stop offset=".75" stop-color="white"/><stop offset="1" stop-color="black"/></radialGradient>
      <mask id="item"><rect width="184" height="184" fill="url(#focus)"/></mask>
    </defs>
    <rect width="184" height="184" fill="url(#rainbow)" mask="url(#item)"/>
  </svg>`;
  const svg = ownRelicNode(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
  svg.id = `${FILTER_ID}-defs`; svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
  svg.style.position = 'absolute'; svg.style.pointerEvents = 'none';
  svg.innerHTML = `<defs><filter id="${FILTER_ID}" color-interpolation-filters="sRGB" primitiveUnits="objectBoundingBox" x="0" y="0" width="100%" height="100%">
    <feImage href="data:image/svg+xml,${encodeURIComponent(rainbow)}" x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="rainbow"/>
    <feBlend in="rainbow" in2="SourceGraphic" mode="color"/>
  </filter></defs>`;
  document.body.append(svg);
  const style = ownRelicNode(document.createElement('style'));
  style.id = STYLE_ID;
  style.textContent = `
    #relics > div.relic-shiny > img {
      filter: url(#${FILTER_ID}) brightness(1.35) saturate(1.35);
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
  const observer = new MutationObserver(highlight);
  observer.observe(grid, { childList: true, subtree: true });
  onRelicPageDispose(() => observer.disconnect());
  highlight();
}
