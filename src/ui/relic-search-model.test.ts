import { emptySearch, matchesRelic, parseSearch, RelicRecord } from './relic-search-model';

const catalog = { qualities: [{ value: 'shoddy', label: 'Schäbig' }, { value: 'polished', label: 'Robust' }], types: [{ value: 'saddle', label: 'Sattel' }, { value: 'horseshoe', label: 'Hufeisen' }] };
const saddle: RelicRecord = { name: 'Schäbiger Sattel', type: 'saddle', quality: 'shoddy', main_stat: { name: 'Stall: -5% Rekrutierungskosten' }, sub_stats: [{ id: 26, name: 'Leichte Kavallerie: +1% Angriffsstärke' }, { id: 38, name: 'Katapult: +2% Verteidigungsstärke', perfect: true }] };
const check = (query: string, changes = {}) => matchesRelic(saddle, { ...emptySearch(), ...changes }, parseSearch(query, catalog));

test('recognizes shiny, inflected quality, type and abbreviations', () => {
  expect(check('shiny schaebiger sattel kata def')).toBe(true);
  expect(check('lk off')).toBe(true);
  expect(check('robust sattel')).toBe(false);
});
test('uses OR for multiple types and qualities, AND across groups', () => {
  expect(check('hufeisen sattel robust schäbig')).toBe(true);
  expect(check('', { types: ['horseshoe', 'saddle'], qualities: ['polished'] })).toBe(false);
});
test('excludes shiny and negative terms', () => {
  expect(check('ohne shiny')).toBe(false);
  expect(check('-shiny')).toBe(false);
  expect(check('sattel -katapult')).toBe(false);
  expect(check('sattel -holz')).toBe(true);
});
test('combines typed search with toggles rather than overriding them', () => {
  expect(check('shiny', { shiny: 'no' })).toBe(false);
  expect(check('hufeisen', { types: ['saddle'] })).toBe(false);
});
test('supports any or all selected substats', () => {
  expect(check('', { substats: ['26', '99'] })).toBe(true);
  expect(check('', { substats: ['26', '99'], allSubstats: true })).toBe(false);
  expect(check('', { substats: ['26', '38'], allSubstats: true })).toBe(true);
});
test('handles quoted phrases, partial text and umlauts', () => {
  expect(check('"leichte kavallerie" verteidigung')).toBe(true);
  expect(check('rekrutierung')).toBe(true);
  expect(check('unbekannterbegriff')).toBe(false);
});
