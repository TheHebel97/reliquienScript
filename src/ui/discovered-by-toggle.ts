const STYLE_ID = 'reliquiensrtipz-discovered-by-toggle-style';
const TOGGLE_ID = 'reliquiensrtipz-discovered-by-toggle';
const STORAGE_KEY = 'reliquiensrtipz:show-discovered-by';
const HIDDEN_CLASS = 'reliquiensrtipz-hide-discovered-by';

export function installDiscoveredByToggle(): void {
  if (document.getElementById(TOGGLE_ID)) return;
  const nav = Array.from(document.querySelectorAll<HTMLTableElement>('table.vis'))
    .find(table => Boolean(table.querySelector('a[href*="screen=relic_system"][href*="mode=inventory"]')));
  const row = nav?.querySelector('tr');
  if (!nav || !row) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    html.${HIDDEN_CLASS} .discovered_by { display: none !important; }
    table.reliquiensrtipz-relic-nav { width: 100%; }
    td.reliquiensrtipz-discovered-by-cell { width: 100%; text-align: right; white-space: nowrap; }
    #${TOGGLE_ID} {
      display: inline-block;
      padding: 2px 6px;
      border: 1px solid #a78c61;
      border-radius: 8px;
      background: #f1e3c3;
      color: #6e593b;
      font: 11px Verdana, sans-serif;
      cursor: pointer;
      user-select: none;
    }
    #${TOGGLE_ID}[aria-pressed="false"] { opacity: .65; }
    #${TOGGLE_ID}:focus-visible { outline: 2px solid #79552d; outline-offset: 1px; }
  `;
  document.head.appendChild(style);
  nav.classList.add('reliquiensrtipz-relic-nav');

  let visible = true;
  try { visible = localStorage.getItem(STORAGE_KEY) !== 'false'; } catch { /* Default is visible. */ }
  const cell = document.createElement('td');
  cell.className = 'center reliquiensrtipz-discovered-by-cell';
  const toggle = document.createElement('span');
  toggle.id = TOGGLE_ID;
  toggle.setAttribute('role', 'button');
  toggle.tabIndex = 0;
  cell.appendChild(toggle);
  row.appendChild(cell);

  const render = (): void => {
    document.documentElement.classList.toggle(HIDDEN_CLASS, !visible);
    toggle.setAttribute('aria-pressed', String(visible));
    toggle.textContent = visible ? 'Entdeckt von: an' : 'Entdeckt von: aus';
  };
  const change = (): void => {
    visible = !visible;
    try { localStorage.setItem(STORAGE_KEY, String(visible)); } catch { /* UI remains usable without storage. */ }
    render();
  };
  toggle.addEventListener('click', change);
  toggle.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    change();
  });
  render();
}
