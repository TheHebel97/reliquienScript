import { defaultSort, relicSortFields, sortRelics, substatStrength } from './relic-sort';
import { emptySearch, matchesRelic, parseSearch, RelicRecord } from './relic-search-model';

const fields = relicSortFields([{ value: 'axe', label: 'Axt' }, { value: 'horseshoe', label: 'Hufeisen' }]);
const make = (name: string, range?: number, quality = 'shoddy', type = 'axe'): RelicRecord => ({ name, range, quality, type, main_stat: { name: '' }, sub_stats: [] });
test('extracts numeric percentage strength including decimals and reductions', () => {
  expect(substatStrength('Katapult: +12,5% Verteidigung')).toBe(12.5);
  expect(substatStrength('Stall: −10% Rekrutierungskosten')).toBe(10);
  expect(substatStrength('Bonus: +1.5%')).toBe(1.5);
  expect(substatStrength('Bonus: +0%')).toBe(0);
  expect(substatStrength('Bonus unbekannt')).toBeUndefined();
  expect(substatStrength('Bonus +1% und +2%')).toBeUndefined();
});
test('sorts only the chosen substat numerically, missing stats last in either direction', () => {
  const sf = relicSortFields([], [{ value: '38', label: 'Katapult: +x% Verteidigung' }]);
  const items = [
    { ...make('two'), sub_stats: [{ id: 38, name: '+2% Verteidigung' }] },
    { ...make('other'), sub_stats: [{ id: 26, name: '+99% Angriff' }] },
    { ...make('ten'), sub_stats: [{ id: 38, name: '+10% Verteidigung' }] }
  ];
  expect(sortRelics(items, { field: 'substat:38', descending: true }, sf).map(r => r.name)).toEqual(['ten', 'two', 'other']);
  expect(sortRelics(items, { field: 'substat:38', descending: false }, sf).map(r => r.name)).toEqual(['two', 'ten', 'other']);
});
test('sorts actual numbers, keeps ties stable in both directions and missing values last', () => {
  const items = [make('ten', 10), make('two', 2), make('missing'), make('two-again', 2)];
  expect(sortRelics(items, { field: 'range', descending: false }, fields).map(r => r.name)).toEqual(['two', 'two-again', 'ten', 'missing']);
  expect(sortRelics(items, { field: 'range', descending: true }, fields).map(r => r.name)).toEqual(['ten', 'two', 'two-again', 'missing']);
  expect(items.map(r => r.name)).toEqual(['ten', 'two', 'missing', 'two-again']);
});
test('uses quality progression and German type labels', () => {
  const items = [make('high', 2, 'renowned', 'horseshoe'), make('low', 2), make('mid', 2, 'refined')];
  expect(sortRelics(items, { field: 'quality', descending: false }, fields).map(r => r.name)).toEqual(['low', 'mid', 'high']);
  expect(sortRelics(items, { field: 'type', descending: false }, fields).map(r => r.name)).toEqual(['low', 'mid', 'high']);
});
test('sorts by the number of shiny substats', () => {
  const items = [make('zero'), { ...make('two'), sub_stats: [1, 2].map(id => ({ id, name: '', perfect: true })) }];
  expect(sortRelics(items, { field: 'shiny', descending: true }, fields)[0].name).toBe('two');
});
test('standard preserves native filtered order and sorting does not reintroduce excluded items', () => {
  const items = [make('keep ten', 10), make('excluded', 3), make('keep two', 2)];
  const state = { ...emptySearch(), query: 'keep' };
  const parsed = parseSearch(state.query, { qualities: [], types: [] });
  const filtered = items.filter(r => matchesRelic(r, state, parsed));
  expect(sortRelics(filtered, { field: 'range', descending: false }, fields).map(r => r.name)).toEqual(['keep two', 'keep ten']);
  expect(sortRelics(filtered, defaultSort(), fields).map(r => r.name)).toEqual(['keep ten', 'keep two']);
});
