import { addDockedPanel } from './docked-panels';
import { defaultSort, relicSortFields, sortRelics } from './relic-sort';
import { Choice, emptySearch, matchesRelic, parseSearch, RelicRecord, SearchState } from './relic-search-model';

interface Inventory {
  filters: Record<string, unknown>; page: number; inventory_relics: RelicRecord[];
  updateData(...args: unknown[]): void; updateUI(): void; getMaxPage(): number;
  getGroupedInventoryRelics(): unknown[];
  RelicsGridPanel: { deselectRelic(): void };
}
declare const RelicSystem: { Inventory: Inventory } | undefined;

export function installRelicSearch(): void {
  const container = document.getElementById('relics_container');
  if (!container || document.getElementById('relic-search') || typeof RelicSystem === 'undefined') return;
  const inventory = RelicSystem.Inventory;
  const options = (id: string): Choice[] => Array.from(document.querySelectorAll<HTMLOptionElement>(`#${id} option`))
    .filter(o => o.value).map(o => ({ value: o.value, label: o.textContent || o.value }));
  const catalog = { qualities: options('inventory_filter_quality'), types: options('inventory_filter_type') };
  const substats = options('inventory_filter_sub1');
  if (!catalog.types.length) return;
  let state = emptySearch();
  let sorting = defaultSort();
  const sortFields = relicSortFields(catalog.types, substats);
  const parsedQuery = () => parseSearch(state.query, catalog);
  let total = 0;
  const style = document.createElement('style');
  style.textContent = `
    #relics_container .ui-dropdown { display: none !important; }
    #relic-search { margin: 0 0 10px; color: #412b13; }
    #relic-search .search-line { display: flex; gap: 6px; }
    #relic-search .sort-line { display: flex; align-items: center; gap: 5px; margin-top: 4px; font-size: 11px; white-space: nowrap; }
    #relic-search .sort-line select { width: auto; max-width: 160px; height: 22px; padding: 0 3px; color: #412b13; background: #f4e4c2; border: 1px solid #b39a6b; font: inherit; }
    #relic-search .sort-line button { height: 22px; min-width: 24px; padding: 0 5px; border-radius: 3px; }
    #relic-search .sort-line button:disabled { opacity: .45; cursor: default; }
    #relic-search input { flex: 1; min-width: 0; padding: 8px 10px; border: 1px solid #ab8955; border-radius: 6px; background: #fff6df; }
    :is(#relic-search, #relic-filter-window) button:not(.relic-dock-handle) { cursor: pointer; font: inherit; color: inherit; border: 1px solid #b39a6b; border-radius: 12px; padding: 3px 9px; background: #f4e4c2; }
    :is(#relic-search, #relic-filter-window) button:not(.relic-dock-handle)[aria-pressed="true"] { background: #76502d; color: #fff4d9; border-color: #563716; }
    :is(#relic-search, #relic-filter-window) button:not(.relic-dock-handle):focus-visible, #relic-search input:focus-visible { outline: 2px solid #915dac; outline-offset: 2px; }
    #relic-filter-window .filter-groups { display: block; margin: 0; }
    #relic-filter-window details { width: 100%; border-bottom: 1px solid #c8b58e; }
    #relic-filter-window summary { cursor: pointer; font-weight: bold; padding: 3px 0; }
    #relic-filter-window .choices { display: flex; flex-wrap: wrap; gap: 4px; max-height: 150px; overflow: auto; padding: 4px 2px; }
    #relic-filter-window .active-filters { display: flex; flex-wrap: wrap; gap: 4px; margin: 5px 0; }
    #relic-search .search-status { display: block; font-size: 12px; margin-top: 5px; }
  `;
  document.head.appendChild(style);
  const root = document.createElement('section');
  root.id = 'relic-search';
  root.setAttribute('aria-label', 'Reliquien suchen und filtern');
  const line = document.createElement('div'); line.className = 'search-line';
  const input = document.createElement('input'); input.type = 'search'; input.id = 'relic-search-input';
  input.setAttribute('aria-label', 'Reliquien suchen'); input.placeholder = 'z. B. shiny katapult verteidigung';
  const button = (label: string, action: () => void): HTMLButtonElement => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', action); return b;
  };
  const filterWindow = document.createElement('aside');
  filterWindow.id = 'relic-filter-window';
  filterWindow.setAttribute('aria-label', 'Inventarfilter');
  document.body.append(filterWindow);
  const dock = addDockedPanel(filterWindow, 'Filter');
  const trigger = button('Filter', () => setOpen(filterWindow.hidden));
  trigger.id = 'relic-filter-trigger'; trigger.setAttribute('aria-controls', filterWindow.id);
  function setOpen(open: boolean): void {
    dock.setVisible(open); trigger.setAttribute('aria-expanded', String(open));
  }
  trigger.setAttribute('aria-expanded', 'true');
  line.append(input, trigger, button('Zurücksetzen', () => { state = emptySearch(); sorting = defaultSort(); input.value = ''; apply(); }));
  const sortLine = document.createElement('div'); sortLine.className = 'sort-line';
  const sortLabel = document.createElement('label'); sortLabel.textContent = 'Sortieren:'; sortLabel.htmlFor = 'relic-sort-field';
  const sortSelect = document.createElement('select'); sortSelect.id = 'relic-sort-field';
  const substatSortGroup = document.createElement('optgroup'); substatSortGroup.label = 'Substat-Stärke';
  sortFields.forEach(field => {
    const option = document.createElement('option'); option.value = field.id; option.textContent = field.label;
    (field.id.startsWith('substat:') ? substatSortGroup : sortSelect).append(option);
  });
  sortSelect.append(substatSortGroup);
  const direction = button('↑', () => { sorting.descending = !sorting.descending; apply(); }); direction.id = 'relic-sort-direction';
  sortSelect.addEventListener('change', () => {
    sorting.field = sortSelect.value;
    if (sorting.field === 'standard') sorting.descending = false;
    if (sorting.field.startsWith('substat:')) sorting.descending = true;
    apply();
  });
  sortLine.append(sortLabel, sortSelect, direction);
  const groups = document.createElement('div'); groups.className = 'filter-groups';
  const active = document.createElement('div'); active.className = 'active-filters';
  const status = document.createElement('output'); status.className = 'search-status'; status.setAttribute('aria-live', 'polite');
  root.append(line, sortLine, status); container.prepend(root);
  const closeButton = button('Schließen', () => { setOpen(false); trigger.focus(); });
  closeButton.className = 'relic-dock-close';
  closeButton.setAttribute('aria-label', 'Filterfenster schließen');
  filterWindow.append(closeButton, groups, active);
  type MultiKey = 'qualities' | 'types' | 'substats' | 'effects' | 'targets';
  const controls: Array<{ button: HTMLButtonElement; selected: () => boolean }> = [];
  const labels = new Map<string, string>();
  const sections: Array<{ summary: HTMLElement; title: string; count: () => number }> = [];
  const group = (title: string, count: () => number): HTMLElement => {
    const details = document.createElement('details'); const summary = document.createElement('summary'); summary.textContent = title;
    const choices = document.createElement('div'); choices.className = 'choices'; details.append(summary, choices); groups.append(details);
    sections.push({ summary, title, count });
    return choices;
  };
  const addMulti = (key: MultiKey, title: string, values: Choice[]) => {
    const parent = group(title, () => new Set([...state[key], ...((key === 'types' || key === 'qualities') ? parsedQuery()[key] : [])]).size);
    values.forEach(choice => {
      labels.set(key + ':' + choice.value, choice.label);
      const b = button(choice.label, () => {
        state[key] = state[key].includes(choice.value) ? state[key].filter(v => v !== choice.value) : [...state[key], choice.value]; apply();
      });
      b.dataset.filter = key; b.dataset.value = choice.value;
      parent.append(b); controls.push({ button: b, selected: () => state[key].includes(choice.value) });
    });
    return parent;
  };
  addMulti('qualities', 'Qualität', catalog.qualities);
  addMulti('types', 'Typ', catalog.types);
  const props = ['Angriff', 'Verteidigung', 'Rekrutierungskosten', 'Geschwindigkeit', 'Produktion', 'Gebäudeschaden', 'Kapazität'];
  addMulti('effects', 'Eigenschaften', props.map(label => ({ value: label, label })));
  const targets = Array.from(new Set(substats.map(s => s.label.split(':')[0]).filter(s => !s.includes('%'))));
  addMulti('targets', 'Einheiten & Gebäude', targets.map(label => ({ value: label, label })));
  const subs = addMulti('substats', 'Substats', substats);
  const mode = button('Alle gewählten Substats erforderlich', () => { state.allSubstats = !state.allSubstats; apply(); });
  subs.prepend(mode); controls.push({ button: mode, selected: () => state.allSubstats });
  const shinyGroup = group('Shiny', () => state.shiny !== 'all' || parsedQuery().shiny !== 'all' ? 1 : 0);
  (['all', 'yes', 'no'] as const).forEach((value, i) => {
    const b = button(['Alle', 'Nur Shiny', 'Ohne Shiny'][i], () => { state.shiny = value; apply(); });
    shinyGroup.append(b); controls.push({ button: b, selected: () => state.shiny === value });
  });
  const renderControls = () => {
    sortSelect.value = sorting.field;
    sortSelect.title = sortFields.find(f => f.id === sorting.field)?.label || 'Standard';
    if (sorting.field.startsWith('substat:')) sortSelect.title += ' · Stärke in %; ohne diesen Substat zuletzt';
    direction.disabled = sorting.field === 'standard';
    direction.textContent = sorting.descending ? '↓' : '↑';
    direction.title = sorting.field === 'standard' ? 'Ursprüngliche Inventarreihenfolge' : (sorting.descending ? 'Absteigend – aufsteigend sortieren' : 'Aufsteigend – absteigend sortieren');
    direction.setAttribute('aria-label', direction.title);
    const parsed = parsedQuery();
    let count = 0;
    sections.forEach(section => {
      const n = section.count(); count += n;
      section.summary.textContent = section.title + (n ? ' (' + n + ')' : '');
    });
    const title = count ? 'Filter (' + count + ')' : 'Filter';
    trigger.textContent = title; dock.setTitle(title);
    controls.forEach(c => c.button.setAttribute('aria-pressed', String(c.selected())));
    active.replaceChildren();
    (['qualities', 'types', 'effects', 'targets', 'substats'] as MultiKey[]).forEach(key => state[key].forEach(value => {
      active.append(button(`${labels.get(key + ':' + value)} ×`, () => { state[key] = state[key].filter(v => v !== value); apply(); }));
    }));
    if (state.shiny !== 'all') active.append(button(`${state.shiny === 'yes' ? 'Nur Shiny' : 'Ohne Shiny'} ×`, () => { state.shiny = 'all'; apply(); }));
    parsed.recognized.forEach(term => active.append(button(`Suche: ${term} ×`, () => {
      state.query = state.query.replace(term, '').trim(); input.value = state.query; apply();
    })));
  };
  // Keep the game's eligibility rules (equipped, offered and slotted relics).
  // Our predicate replaces only the four native UI filters, before native grouping.
  const originalData = inventory.updateData;
  inventory.updateData = function (...args: unknown[]) {
    Object.keys(inventory.filters).forEach(key => { inventory.filters[key] = null; });
    originalData.apply(this, args);
    total = inventory.inventory_relics.length;
    const parsed = parsedQuery();
    inventory.inventory_relics = sortRelics(inventory.inventory_relics.filter(r => matchesRelic(r, state, parsed)), sorting, sortFields);
  };
  const originalUI = inventory.updateUI;
  inventory.updateUI = function () {
    inventory.page = Math.max(0, Math.min(inventory.page, inventory.getMaxPage()));
    originalUI.call(this);
    const count = inventory.inventory_relics.length;
    const stacks = inventory.getGroupedInventoryRelics().length;
    status.textContent = count ? `${count} von ${total} Reliquien · ${stacks} Kacheln · Seite ${inventory.page + 1}/${inventory.getMaxPage() + 1}` : 'Keine Treffer – ändere die Suche oder setze die Filter zurück.';
  };
  function apply(): void {
    inventory.page = 0;
    inventory.RelicsGridPanel.deselectRelic();
    document.getElementById('relic-hover-details')?.setAttribute('hidden', '');
    inventory.updateData(); renderControls(); inventory.updateUI();
    window.dispatchEvent(new Event('resize'));
  }
  input.addEventListener('input', () => { state.query = input.value; apply(); });
  apply();
}
