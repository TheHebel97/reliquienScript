/** @jest-environment jsdom */
import { installRelicPresets } from './relic-presets';
import { DEFAULT_PRESET_COLOR, presetColor, readPresets, writePresets } from './relic-preset-model';
import { DEFAULT_PRESETS } from './relic-preset-defaults';
import { installRelicShinyHighlight } from './relic-shiny-highlight';

jest.mock('./docked-panels', () => ({
  addDockedPanel: (element: HTMLElement) => ({
    setVisible: (visible: boolean) => { element.hidden = !visible; }, setTitle: () => {}
  })
}));

const key = 'reliquiensrtipz:relic-presets';
const records = {
  '1': { type: 'greataxe', sub_stats: [{ id: 5 }, { id: 24 }] },
  '2': { type: 'greataxe', sub_stats: [{ id: 5 }, { id: 9 }] }
};
const input = (): HTMLInputElement => document.getElementById('relic-preset-name') as HTMLInputElement;
const type = (): HTMLSelectElement => document.getElementById('relic-preset-type') as HTMLSelectElement;
const stat = (id: string): HTMLButtonElement => document.querySelector<HTMLButtonElement>(`#relic-preset-form button[data-substat="${id}"]`)!;
const addStat = (id: string): void => {
  const select = document.getElementById('relic-preset-substat') as HTMLSelectElement;
  select.value = id; select.dispatchEvent(new Event('change'));
  document.getElementById('relic-preset-add-substat')!.click();
};
const card = (): HTMLElement => document.querySelector<HTMLElement>('.preset-card')!;
const stored = () => readPresets(localStorage.getItem(key));
const submit = (): void => { document.getElementById('relic-preset-form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); };
const tile = (id: string): HTMLElement => document.querySelector<HTMLImageElement>(`#relics img[data-id="${id}"]`)!.parentElement!;
const create = (): void => { document.getElementById('relic-preset-new')!.click(); input().value = 'Axt + LK Off'; type().value = 'greataxe'; addStat('5'); addStat('24'); submit(); };

beforeEach(() => {
  localStorage.clear(); localStorage.setItem(key, writePresets([], DEFAULT_PRESETS.map(p => p.id))); document.head.replaceChildren();
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function () { this.setAttribute('open', ''); } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function () { this.removeAttribute('open'); } });
  document.body.innerHTML = `<div id="relic-search"><div class="search-line"><input id="search" value="meine Suche"><button>Filter</button><button>Zurücksetzen</button></div></div>
    <select id="inventory_filter_type"><option value="greataxe">Großaxt</option><option value="saddle">Sattel</option></select>
    <img src="https://dsde.innogamescdn.com/asset/test-version/graphic/loading.gif" alt="">
    <select id="inventory_filter_sub1"><option value="3">Axtkämpfer: +x% Angriffs- und Verteidigungsstärke</option><option value="5">Leichte Kavallerie: +x% Angriffs- und Verteidigungsstärke</option><option value="24">Axtkämpfer: +x% Angriffsstärke</option><option value="9">Rammbock: +x% Gebäudeschaden</option></select>
    <div id="relics"><div class="relic-shiny"><img data-id="1"></div><div><img data-id="2"></div></div>`;
  Object.defineProperty(globalThis, 'RelicSystem', { configurable: true, value: {
    getRelicById: jest.fn((id: keyof typeof records) => records[id])
  } });
  Object.defineProperty(crypto, 'randomUUID', { configurable: true, value: jest.fn(() => 'preset-id') });
});

test('saves exact combinations and preserves shiny classes, search and native grid nodes', () => {
  installRelicPresets();
  const image = tile('1').querySelector('img');
  create();
  expect(stored()).toEqual([{ id: 'preset-id', name: 'Axt + LK Off', enabled: true, type: 'greataxe', substats: ['5', '24'] }]);
  expect(tile('1').classList.contains('relic-preset')).toBe(true);
  expect(tile('1').classList.contains('relic-shiny')).toBe(true);
  expect(tile('2').classList.contains('relic-preset-partial')).toBe(true);
  expect(tile('1').querySelector('img')).toBe(image);
  expect((document.getElementById('search') as HTMLInputElement).value).toBe('meine Suche');
  expect(Array.from(card().querySelectorAll<HTMLImageElement>('.preset-bonus img')).map(i => i.src)).toEqual([
    'https://dsde.innogamescdn.com/asset/test-version/graphic/unit/unit_axe.webp',
    'https://dsde.innogamescdn.com/asset/test-version/graphic/unit/unit_light.webp',
    'https://dsde.innogamescdn.com/asset/test-version/graphic/unit/unit_axe.webp'
  ]);
  expect(card().querySelector('.preset-summary')!.textContent).toContain('A/D');
  expect(card().querySelectorAll('.preset-bonus')[2].getAttribute('aria-label')).toContain('Angriffsstärke');
  const failed = card().querySelector<HTMLImageElement>('.preset-bonus img')!;
  failed.dispatchEvent(new Event('error'));
  expect(card().querySelector('.preset-summary')!.textContent).toContain('AXE');
});

test('toggles, edits a disabled preset without enabling it, then deletes it', () => {
  installRelicPresets(); create();
  card().querySelector<HTMLInputElement>('input')!.click();
  expect(stored()[0].enabled).toBe(false);
  expect(tile('1').classList.contains('relic-preset')).toBe(false);
  card().querySelector<HTMLButtonElement>('button')!.click();
  input().value = 'Geändert'; stat('24').click(); addStat('9'); submit();
  expect(stored()[0]).toMatchObject({ name: 'Geändert', enabled: false, substats: ['5', '9'] });
  card().querySelector<HTMLInputElement>('input')!.click();
  expect(tile('2').classList.contains('relic-preset')).toBe(true);
  card().querySelector<HTMLButtonElement>('button')!.click();
  document.querySelector<HTMLButtonElement>('#relic-preset-form .preset-actions button:last-child')!.click();
  expect(stored()).toEqual([]);
  expect(tile('2').classList.contains('relic-preset')).toBe(false);
  expect(tile('2').classList.contains('relic-preset-partial')).toBe(false);
});

test('loads saved presets and reapplies them after native paging or filtering rebuilds tiles', async () => {
  localStorage.setItem(key, writePresets([{ id: 'saved', name: 'Gespeichert', enabled: true, type: 'greataxe', substats: ['5', '24'] }], DEFAULT_PRESETS.map(p => p.id)));
  installRelicPresets();
  expect(tile('1').classList.contains('relic-preset')).toBe(true);
  document.getElementById('relics')!.innerHTML = '<div><img data-id="2"></div><div><img data-id="1"></div>';
  await Promise.resolve();
  expect(tile('1').classList.contains('relic-preset')).toBe(true);
  expect(tile('2').classList.contains('relic-preset-partial')).toBe(true);
  expect(card().textContent).toContain('Gespeichert');
});

test('rejects empty conditions and preserves unavailable saved conditions while editing', () => {
  localStorage.setItem(key, writePresets([{ id: 'old', name: 'Altes Preset', enabled: true, type: 'missing', substats: ['999'] }], DEFAULT_PRESETS.map(p => p.id)));
  installRelicPresets();
  card().querySelector<HTMLButtonElement>('button')!.click();
  expect(type().value).toBe('missing');
  expect(stat('999').textContent).toContain('Nicht verfügbar');
  submit();
  expect(stored()[0]).toMatchObject({ type: 'missing', substats: ['999'] });
  expect(document.querySelector('#relic-preset-form output')!.textContent).toContain('nicht mehr verfügbar');
  type().value = ''; stat('999').click(); submit();
  expect(document.querySelector('#relic-preset-form output')!.textContent).toContain('mindestens');
  expect(stored()).toHaveLength(1);
});

test('shows ten switches together and edits in a separate modal without replacing the list', () => {
  localStorage.setItem(key, writePresets(Array.from({ length: 10 }, (_, i) => ({ id: String(i), name: `Preset ${i}`, enabled: true, type: 'greataxe', substats: ['5', '24'] })), DEFAULT_PRESETS.map(p => p.id)));
  installRelicPresets();
  expect(document.getElementById('relic-preset-form')!.hidden).toBe(true);
  expect(document.querySelectorAll('.preset-card')).toHaveLength(10);
  expect(stored()).toHaveLength(10);
  expect(tile('1').classList.contains('relic-preset')).toBe(true);
  card().querySelector<HTMLButtonElement>('button')!.click();
  expect(document.getElementById('relic-preset-form')!.hidden).toBe(false);
  expect(document.querySelector<HTMLElement>('.preset-list')!.hidden).toBe(false);
  const modal = document.getElementById('relic-preset-editor') as HTMLDialogElement;
  expect(modal.open).toBe(true);
  expect(document.getElementById('relic-preset-window')!.contains(modal)).toBe(false);
  modal.dispatchEvent(new Event('cancel', { cancelable: true }));
  expect(modal.open).toBe(false);
  expect(stored()).toHaveLength(10);
});

test('keeps archer-world rows compact, including failed icon downloads', () => {
  document.getElementById('inventory_filter_type')!.insertAdjacentHTML('beforeend', '<option value="longbow">Langbogen</option><option value="shortbow">Kurzbogen</option>');
  document.getElementById('inventory_filter_sub1')!.insertAdjacentHTML('beforeend', '<option value="4">Bogenschütze: +x% Angriffs- und Verteidigungsstärke</option><option value="6">Berittener Bogenschütze: +x% Angriffs- und Verteidigungsstärke</option><option value="26">Berittener Bogenschütze: +x% Angriffsstärke</option>');
  localStorage.setItem(key, writePresets([{ id: 'archer', name: 'Bögen', enabled: true, type: 'longbow', substats: ['6', '26'] }], DEFAULT_PRESETS.map(p => p.id)));
  installRelicPresets();
  const badges = Array.from(card().querySelectorAll<HTMLElement>('.preset-bonus'));
  expect(badges.map(b => b.querySelector('img')?.getAttribute('src')?.split('/').pop())).toEqual(['unit_archer.webp', 'unit_marcher.webp', 'unit_marcher.webp']);
  badges.forEach(b => b.querySelector('img')!.dispatchEvent(new Event('error')));
  expect(badges.every(b => b.textContent!.length <= 8)).toBe(true);
  expect(badges[1].getAttribute('aria-label')).toContain('Berittener Bogenschütze');
});

test('actual shiny highlighting coexists with presets after toggles and native grid replacement', async () => {
  Object.defineProperty(globalThis, 'RelicSystem', { configurable: true, value: {
    getRelicById: (id: keyof typeof records) => ({ ...records[id], sub_stats: records[id].sub_stats.map((s, i) => ({ ...s, perfect: id === '1' && i === 0 })) })
  } });
  installRelicShinyHighlight(); installRelicPresets(); create();
  card().querySelector<HTMLButtonElement>('button')!.click();
  (document.getElementById('relic-preset-shiny') as HTMLInputElement).checked = true; submit();
  expect(stored()[0].shinyOnly).toBe(true);
  expect(tile('1').className).toContain('relic-shiny');
  expect(tile('1').className).toContain('relic-preset');
  card().querySelector<HTMLInputElement>('input')!.click();
  expect(tile('1').className).toContain('relic-shiny');
  expect(tile('1').className).not.toContain('relic-preset');
  card().querySelector<HTMLInputElement>('input')!.click();
  document.getElementById('relics')!.innerHTML = '<div><img data-id="1"></div><div><img data-id="2"></div>';
  await Promise.resolve();
  expect(tile('1').classList.contains('relic-shiny')).toBe(true);
  expect(tile('1').classList.contains('relic-preset')).toBe(true);
  expect(tile('2').classList.contains('relic-shiny')).toBe(false);
  expect(document.querySelector('#reliquien-shiny-rainbow feBlend')?.getAttribute('mode')).toBe('color');
  expect(document.getElementById('reliquiensrtipz-shiny-highlight')!.textContent).not.toMatch(/outline:|border:/);
  const picker = document.getElementById('relic-preset-color') as HTMLInputElement;
  expect(picker.value).toBe(DEFAULT_PRESET_COLOR);
  picker.value = '#c73721'; picker.dispatchEvent(new Event('input')); picker.dispatchEvent(new Event('change'));
  expect(document.getElementById('relics')!.style.getPropertyValue('--relic-preset-color')).toBe('#c73721');
  expect(presetColor(localStorage.getItem(key))).toBe('#c73721');
  expect(stored()[0].shinyOnly).toBe(true);
  expect(tile('1').classList.contains('relic-shiny')).toBe(true);
  expect(tile('1').classList.contains('relic-preset')).toBe(true);
});

test('full matches win over partial matches and both colors survive saving and reinstallation', () => {
  localStorage.setItem(key, writePresets([
    { id: 'partial', name: 'Teiltreffer', enabled: true, type: 'greataxe', substats: ['5', '9'] },
    { id: 'full', name: 'Volltreffer', enabled: true, type: 'greataxe', substats: ['5', '24'] }
  ], DEFAULT_PRESETS.map(p => p.id), '#bada55', '#ff8800'));
  installRelicPresets();
  expect(tile('1').dataset.relicPresetLevel).toBe('3');
  expect(tile('1').classList.contains('relic-preset-partial')).toBe(false);
  const fullSwitch = document.querySelector<HTMLInputElement>('[data-preset-id="full"] input')!;
  fullSwitch.click();
  expect(tile('1').dataset.relicPresetLevel).toBe('2');
  expect(tile('1').classList.contains('relic-preset-partial')).toBe(true);
  const picker = document.getElementById('relic-preset-partial-color') as HTMLInputElement;
  expect(picker.value).toBe('#ff8800');
  picker.value = '#44aabb'; picker.dispatchEvent(new Event('change'));
  expect(presetColor(localStorage.getItem(key), true)).toBe('#44aabb');
  expect(presetColor(localStorage.getItem(key))).toBe('#bada55');
  document.getElementById('relic-preset-window')!.remove();
  document.getElementById('relic-preset-editor')!.remove();
  document.getElementById('relic-preset-trigger')!.remove();
  installRelicPresets();
  expect((document.getElementById('relic-preset-partial-color') as HTMLInputElement).value).toBe('#44aabb');
  expect(tile('1').dataset.relicPresetLevel).toBe('2');
});

test('rainbow shading retains native images and events and follows perfect stats after updates', async () => {
  let perfect = true;
  Object.defineProperty(globalThis, 'RelicSystem', { configurable: true, value: {
    getRelicById: () => ({ sub_stats: [{ perfect }] })
  } });
  const image = tile('1').querySelector('img')!;
  image.setAttribute('src', 'https://example.test/greataxe.webp');
  const nativeClick = jest.fn(); image.addEventListener('click', nativeClick);
  installRelicShinyHighlight(); installRelicShinyHighlight();
  expect(document.querySelectorAll('#reliquien-shiny-rainbow-defs')).toHaveLength(1);
  const gradientSource = document.querySelector('#reliquien-shiny-rainbow feImage')!.getAttribute('href')!;
  expect(decodeURIComponent(gradientSource)).toContain('<linearGradient');
  expect(tile('1').querySelector('img')).toBe(image);
  expect(image.getAttribute('src')).toBe('https://example.test/greataxe.webp');
  image.click(); expect(nativeClick).toHaveBeenCalledTimes(1);
  expect(tile('1').classList.contains('relic-shiny')).toBe(true);
  perfect = false;
  document.getElementById('relics')!.append(document.createTextNode(''));
  await Promise.resolve();
  expect(tile('1').classList.contains('relic-shiny')).toBe(false);
});

test('never highlights both matching substats under a wrong main type, including native rebuilds', async () => {
  let secondType = 'saddle';
  Object.defineProperty(globalThis, 'RelicSystem', { configurable: true, value: {
    getRelicById: (id: string) => ({ ...records['1'], type: id === '2' ? secondType : 'greataxe' })
  } });
  installRelicPresets(); create();
  expect(tile('1').dataset.relicPresetLevel).toBe('3');
  expect(tile('2').classList.contains('relic-preset')).toBe(false);
  const rebuild = async (): Promise<void> => {
    document.getElementById('relics')!.innerHTML = '<div><img data-id="1"></div><div><img data-id="2"></div>';
    await Promise.resolve();
  };
  secondType = 'greataxe'; await rebuild();
  expect(tile('2').dataset.relicPresetLevel).toBe('3');
  secondType = 'saddle'; await rebuild();
  expect(tile('2').classList.contains('relic-preset')).toBe(false);
  expect(tile('2').classList.contains('relic-preset-partial')).toBe(false);
  expect(tile('2').dataset.relicPresetLevel).toBeUndefined();
});
