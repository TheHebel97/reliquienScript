/** @jest-environment jsdom */
import { installRelicGridLayout } from './relic-grid';
import { installRelicSearch } from './relic-search';
import { installRelicPresets } from './relic-presets';
import { RelicRecord } from './relic-search-model';
import { disposeRelicPage } from './relic-page-scope';
import { mockUserscriptStorage } from './test-helpers/userscript-storage';

jest.mock('./docked-panels', () => ({ addDockedPanel: (panel: HTMLElement) => ({
  setVisible: (visible: boolean) => { panel.hidden = !visible; }, setTitle: () => {}
}) }));

interface RecordFixture extends RelicRecord {
  id: number; stack_key: string; village_id?: number; trade_offer_id?: number;
}
interface StackFixture { representative: RecordFixture; count: number; relics: RecordFixture[] }
const record = (id: number, overrides: Partial<RecordFixture> = {}): RecordFixture => ({
  id, stack_key: String(id), name: 'Schäbige Großaxt', type: 'greataxe', quality: 'shoddy', range: 2,
  main_stat: { name: 'Axtkämpfer: +5% Angriffs- und Verteidigungsstärke' },
  sub_stats: [{ id: 5, name: 'Leichte Kavallerie: +2% Angriffs- und Verteidigungsstärke' }], ...overrides
});

// Contract observed on 30 October: eligibility, filtering, stacking, sorting
// and pagination live on Inventory.grid, not on Inventory itself.
class NativeGridFixture {
  page = 0;
  per_page = 1;
  filters: Record<string, string | null> = { quality: null, type: null, sub_stat_1: null, sub_stat_2: null };
  sort = 'quality_desc';
  stack = true;
  constructor(public relics: RecordFixture[], private include: (r: RecordFixture) => boolean) {}
  setRelics(relics: RecordFixture[]): void { this.relics = relics; this.setPage(this.page); }
  matchesFilters(r: RecordFixture): boolean {
    return (!this.filters.quality || r.quality === this.filters.quality) &&
      (!this.filters.type || r.type === this.filters.type) &&
      ['sub_stat_1', 'sub_stat_2'].every(k => !this.filters[k] || r.sub_stats.some(s => String(s.id) === this.filters[k]));
  }
  hasFilters(): boolean { return Object.values(this.filters).some(Boolean); }
  getIncludedRelics(): RecordFixture[] { return this.relics.filter(this.include); }
  getFilteredRelics(): RecordFixture[] { return this.getIncludedRelics().filter(this.matchesFilters, this); }
  getStacks(): StackFixture[] {
    const grouped = new Map<string, StackFixture>();
    this.getFilteredRelics().forEach(r => {
      const key = this.stack ? r.stack_key : String(r.id);
      const group = grouped.get(key);
      if (group) { group.count++; group.relics.push(r); }
      else grouped.set(key, { representative: r, count: 1, relics: [r] });
    });
    const result = Array.from(grouped.values());
    const ranks = ['shoddy', 'polished', 'refined', 'superior', 'renowned'];
    if (this.sort === 'quality_desc') result.sort((a, b) => ranks.indexOf(b.representative.quality) - ranks.indexOf(a.representative.quality));
    return result;
  }
  getMaxPage(): number { return Math.max(0, Math.ceil(this.getStacks().length / this.per_page) - 1); }
  setPage(page: number): void { this.page = Math.max(0, Math.min(page, this.getMaxPage())); }
  getPageStacks(): StackFixture[] { return this.getStacks().slice(this.page * this.per_page, (this.page + 1) * this.per_page); }
}

let inventory: {
  grid: NativeGridFixture; all_relics: RecordFixture[]; relics_to_upgrade: number[];
  updateData: (records?: RecordFixture[]) => void; updateUI: jest.Mock;
  RelicsGridPanel: { deselectRelic: jest.Mock };
};
let windowEvents: jest.SpyInstance;
const search = (text: string): void => {
  const input = document.getElementById('relic-search-input') as HTMLInputElement;
  expect(input).not.toBeNull(); input.value = text; input.dispatchEvent(new Event('input'));
};
const status = (): string => document.querySelector('.search-status')!.textContent!;

beforeEach(() => {
  windowEvents = jest.spyOn(window, 'addEventListener');
  mockUserscriptStorage();
  document.head.replaceChildren(); localStorage.clear();
  document.body.innerHTML = `<div id="page_inventory"><div id="relics_container">
    <div class="ui-dropdown"><select id="inventory_filter_sort"><option value="quality_desc">Qualität</option></select></div>
    <div class="ui-dropdown"><select id="inventory_filter_slot1">
      <option value="">Filter 1</option><optgroup label="Qualität"><option value="q:shoddy">Schäbig</option><option value="q:polished">Robust</option><option value="q:refined">Verbessert</option></optgroup>
      <optgroup label="Typ"><option value="t:greataxe">Großaxt</option><option value="t:banner">Banner</option><option value="t:morningstar">Morgenstern</option></optgroup>
      <optgroup label="Substat"><option value="s:3">Axtkämpfer: +x% Angriffs- und Verteidigungsstärke</option><option value="s:5">Leichte Kavallerie: +x% Angriffs- und Verteidigungsstärke</option><option value="s:9">Rammbock: +x% Gebäudeschaden</option><option value="s:24">Axtkämpfer: +x% Angriffsstärke</option><option value="s:37">Schwere Kavallerie: +x% Verteidigungsstärke</option></optgroup>
    </select></div>
    <div class="ui-dropdown"><select id="inventory_filter_slot2"><option value="t:greataxe">Großaxt</option></select></div>
    <span id="inventory_filter_count"></span><div class="relics-grid-row"><div id="prev_page"></div><div id="relics"></div><div id="next_page"></div></div>
  </div></div>`;
  const records = [record(1, { stack_key: 'axes' }), record(2, { stack_key: 'axes', sub_stats: [{ id: 5, name: 'Leichte Kavallerie: +10% Angriffs- und Verteidigungsstärke', perfect: true }] }),
    record(3, { name: 'Verbessertes Banner', type: 'banner', quality: 'refined', sub_stats: [{ id: 37, name: 'Schwere Kavallerie: +4% Verteidigungsstärke' }] }),
    record(4, { trade_offer_id: 1 }), record(5, { village_id: 1 }), record(6),
    record(7, { name: 'Robuster Morgenstern', type: 'morningstar', quality: 'polished', sub_stats: [{ id: 9, name: 'Rammbock: +3% Gebäudeschaden' }] })];
  inventory = {
    grid: new NativeGridFixture(records, r => !r.village_id && !r.trade_offer_id && !inventory.relics_to_upgrade.includes(r.id)),
    all_relics: records, relics_to_upgrade: [6],
    updateData(records = inventory.all_relics) { inventory.all_relics = records; inventory.grid.setRelics(records); },
    updateUI: jest.fn(() => {
      document.getElementById('relics')!.innerHTML = inventory.grid.getPageStacks().map(stack =>
        `<div><img data-id="${stack.representative.id}" src="https://example.test/graphic/relic.webp"><span class="count">${stack.count}</span></div>`).join('');
    }),
    RelicsGridPanel: { deselectRelic: jest.fn() }
  };
  Object.defineProperty(globalThis, 'RelicSystem', { configurable: true, value: {
    Inventory: inventory, getRelicById: (id: string) => inventory.all_relics.find(r => String(r.id) === id)
  } });
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.setAttribute('open', ''); } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.removeAttribute('open'); } });
});

afterEach(() => {
  disposeRelicPage();
  windowEvents.mock.calls.forEach(([type, listener]) => { if (type === 'resize') window.removeEventListener(type, listener); });
  jest.restoreAllMocks();
});

test('initializes search and presets from prefixed slot options, retaining native IDs', () => {
  installRelicSearch(); installRelicPresets();
  expect(document.getElementById('relic-search-input')).not.toBeNull();
  expect(document.querySelector('[data-filter="types"][data-value="greataxe"]')).not.toBeNull();
  expect(document.querySelector('[data-filter="substats"][data-value="5"]')).not.toBeNull();
  expect(document.querySelector('#relic-sort-field option[value="substat:5"]')).not.toBeNull();
  expect(document.querySelectorAll('.preset-card')).toHaveLength(3);
  expect(document.getElementById('relic-preset-trigger')).not.toBeNull();
});

test('filters before native stacking and preserves eligibility, paging and server updates', () => {
  const originalData = inventory.updateData;
  const records = inventory.all_relics;
  installRelicSearch(); search('großaxt');
  expect(inventory.grid.getFilteredRelics().map(r => r.id)).toEqual([1, 2]);
  expect(inventory.grid.getStacks()[0]).toMatchObject({ count: 2, relics: [records[0], records[1]] });
  expect(status()).toContain('2 von 4 Reliquien · 1 Kacheln · Seite 1/1');
  expect(inventory.all_relics).toBe(records);
  expect(inventory.grid.relics).toBe(records);
  expect(inventory.updateData).toBe(originalData);
  inventory.updateData([...records, record(8)]); inventory.updateUI();
  expect(status()).toContain('3 von 5 Reliquien');
  inventory.relics_to_upgrade.push(1); inventory.updateUI();
  expect(inventory.grid.getFilteredRelics().map(r => r.id)).toEqual([2, 8]);
  inventory.grid.setPage(1); search('nicht-vorhanden');
  expect(inventory.grid.page).toBe(0);
  expect(status()).toContain('Keine Treffer');
  document.querySelectorAll<HTMLButtonElement>('#relic-search button').forEach(button => { if (button.textContent === 'Zurücksetzen') button.click(); });
  expect(inventory.grid.getFilteredRelics().map(r => r.id)).toEqual([2, 3, 7, 8]);
});

test('custom sorting orders native stacks without losing their contents or being reversed by native sorting', () => {
  installRelicSearch();
  const select = document.getElementById('relic-sort-field') as HTMLSelectElement;
  expect(select).not.toBeNull(); select.value = 'quality'; select.dispatchEvent(new Event('change'));
  expect(inventory.grid.getStacks().map(s => s.representative.id)).toEqual([1, 7, 3]);
  expect(inventory.grid.getStacks()[0].count).toBe(2);
  document.getElementById('relic-sort-direction')!.click();
  expect(inventory.grid.getStacks().map(s => s.representative.id)).toEqual([3, 7, 1]);
  select.value = 'substat:5'; select.dispatchEvent(new Event('change'));
  expect(inventory.grid.getStacks()[0].representative.id).toBe(2);
  expect(inventory.grid.getStacks()[0].relics.map(r => r.id)).toEqual([2, 1]);
});

test('resizes the new grid page capacity and retains the previous first item in the resulting page', () => {
  inventory.updateData(Array.from({ length: 220 }, (_, index) => record(index + 100)));
  inventory.grid.per_page = 20; inventory.grid.setPage(5);
  const grid = document.getElementById('relics')!;
  Object.defineProperty(grid, 'clientWidth', { configurable: true, value: 804 });
  jest.spyOn(grid, 'getBoundingClientRect').mockReturnValue({ top: 200 } as DOMRect);
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
  const frames: FrameRequestCallback[] = [];
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.push(callback); return frames.length; });
  Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: class { observe() {} disconnect() {} } });
  installRelicGridLayout();
  frames.splice(0).forEach(callback => callback(0));
  expect(inventory.grid.per_page).toBe(80);
  expect(inventory.grid.page).toBe(1);
  expect(grid.dataset.rows).toBe('8');
  expect(grid.querySelectorAll('img')).toHaveLength(80);
  expect(inventory.RelicsGridPanel.deselectRelic).toHaveBeenCalledTimes(1);
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 300 });
  window.dispatchEvent(new Event('resize'));
  frames.splice(0).forEach(callback => callback(0));
  expect(inventory.grid.per_page).toBe(10);
  expect(inventory.grid.page).toBe(8);
  expect(grid.querySelectorAll('img')).toHaveLength(10);
  inventory.grid.page = NaN; inventory.grid.per_page = NaN;
  window.dispatchEvent(new Event('resize'));
  frames.splice(0).forEach(callback => callback(0));
  expect(inventory.grid.page).toBe(0);
  expect(inventory.grid.per_page).toBe(10);
  grid.remove();
  const fresh = new NativeGridFixture(inventory.all_relics, () => true);
  inventory.grid = fresh;
  window.dispatchEvent(new Event('resize'));
  frames.splice(0).forEach(callback => callback(0));
  expect(fresh.page).toBe(0);
  expect(fresh.per_page).toBe(1);
});

test('search and responsive sizing share native pagination across pages, empty results and slot changes', () => {
  inventory.updateData(Array.from({ length: 220 }, (_, index) => record(index + 100)));
  inventory.grid.per_page = 20;
  const grid = document.getElementById('relics')!;
  Object.defineProperty(grid, 'clientWidth', { configurable: true, value: 804 });
  jest.spyOn(grid, 'getBoundingClientRect').mockReturnValue({ top: 200 } as DOMRect);
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 });
  const frames: FrameRequestCallback[] = [];
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => { frames.push(callback); return frames.length; });
  Object.defineProperty(globalThis, 'ResizeObserver', { configurable: true, value: class { observe() {} disconnect() {} } });
  installRelicGridLayout(); installRelicSearch();
  frames.splice(0).forEach(callback => callback(0));
  expect(inventory.grid.per_page).toBe(80);
  inventory.grid.setPage(1); inventory.updateUI();
  expect(status()).toContain('Seite 2/3');
  expect(grid.querySelectorAll('img')).toHaveLength(80);
  search('nicht-vorhanden');
  expect(grid.querySelectorAll('img')).toHaveLength(0);
  expect(inventory.grid.page).toBe(0);
  search('großaxt');
  expect(status()).toContain('220 von 220 Reliquien · 220 Kacheln · Seite 1/3');
  inventory.relics_to_upgrade.push(100); inventory.updateUI();
  expect(status()).toContain('219 von 219 Reliquien');
  expect(grid.querySelector('img')!.dataset.id).toBe('101');
});
