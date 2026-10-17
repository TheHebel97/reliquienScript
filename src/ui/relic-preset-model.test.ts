import { matchesPreset, presetMatchLevel, readPresets, RelicPreset, writePresets } from './relic-preset-model';

const preset: RelicPreset = { id: 'off', name: 'Axt + LK Off', enabled: true, type: 'greataxe', substats: ['5', '24'] };
const relic = { type: 'greataxe', sub_stats: [{ id: 24 }, { id: 5 }] };

test('requires the type and each substat, accepting combined attack/defence for attack', () => {
  expect(matchesPreset(relic, preset)).toBe(true);
  expect(matchesPreset({ type: 'horseshoe', sub_stats: relic.sub_stats }, preset)).toBe(false);
  expect(matchesPreset({ type: 'greataxe', sub_stats: [{ id: 5 }, { id: 3 }] }, preset)).toBe(true);
  expect(matchesPreset({ type: 'greataxe', sub_stats: [{ id: 5 }] }, preset)).toBe(false);
});

test('supports type-only and stat-only rules, extra stats, disabled rules and missing data', () => {
  expect(matchesPreset(relic, { ...preset, substats: [] })).toBe(true);
  expect(matchesPreset({ ...relic, type: 'other' }, { ...preset, type: '' })).toBe(true);
  expect(matchesPreset({ ...relic, sub_stats: [...relic.sub_stats, { id: 9 }] }, preset)).toBe(true);
  expect(matchesPreset(relic, { ...preset, enabled: false })).toBe(false);
  expect(matchesPreset(relic, { ...preset, type: '', substats: [] })).toBe(false);
  expect(matchesPreset({ type: 'greataxe' }, preset)).toBe(false);
});

test('round-trips multiple presets including disabled settings and German names', () => {
  const presets = [preset, { ...preset, id: 'def', name: 'Schöne Verteidigung', enabled: false }];
  expect(readPresets(writePresets(presets))).toEqual(presets);
});

test('rejects malformed storage without broadening rules or creating match-all presets', () => {
  expect(readPresets(null)).toEqual([]);
  expect(readPresets('{broken')).toEqual([]);
  expect(readPresets(JSON.stringify({ version: 3, presets: [preset] }))).toEqual([]);
  const bad = [null, {}, { ...preset, substats: ['5', null] }, { ...preset, substats: ['5', '5'] },
    { ...preset, enabled: 'true' }, { ...preset, type: '', substats: [] }, { ...preset, name: ' ' }];
  expect(readPresets(JSON.stringify({ version: 1, presets: [...bad, preset, preset] }))).toEqual([preset]);
});

test('combined bonuses satisfy attack and defence, but neither separate bonus implies the other', () => {
  expect(matchesPreset({ type: 'banner', sub_stats: [{ id: 1 }, { id: 7 }] }, { ...preset, type: 'banner', substats: ['31', '37'] })).toBe(true);
  expect(matchesPreset({ type: 'greataxe', sub_stats: [{ id: 33 }, { id: 26 }] }, { ...preset, substats: ['24', '26'] })).toBe(false);
  expect(matchesPreset({ type: 'greataxe', sub_stats: [{ id: 3 }] }, { ...preset, substats: ['24', '33'] })).toBe(false);
});

test('economy requires the main bonus and both actual substats to belong to the allowed pool', () => {
  const economy = { ...preset, type: '', substats: ['14', '15', '16', '13', 'barracks-cost'], allBonuses: true };
  expect(matchesPreset({ type: 'axe', sub_stats: [{ id: 14 }, { id: 16 }] }, economy)).toBe(true);
  expect(matchesPreset({ type: 'backpack', sub_stats: [{ id: 13 }, { id: 15 }] }, economy)).toBe(true);
  expect(matchesPreset({ type: 'chisel', sub_stats: [{ id: 19, name: '-2% Rekrutierungskosten in der Kaserne' }, { id: 13 }] }, economy)).toBe(true);
  expect(matchesPreset({ type: 'greataxe', sub_stats: [{ id: 14 }, { id: 15 }] }, economy)).toBe(false);
  expect(matchesPreset({ type: 'axe', sub_stats: [{ id: 14 }, { id: 24 }] }, economy)).toBe(false);
  expect(matchesPreset({ type: 'axe', sub_stats: [{ id: 14 }] }, economy)).toBe(false);
  expect(matchesPreset({ type: 'axe', sub_stats: [{ id: 44, name: '-2% Rekrutierungskosten für Adelsgeschlechter' }, { id: 13 }] }, economy)).toBe(false);
});

test('shiny-only is optional and persists without losing group conditions', () => {
  const shiny = { ...preset, shinyOnly: true };
  expect(matchesPreset(relic, shiny)).toBe(false);
  expect(matchesPreset({ ...relic, sub_stats: [{ id: 24, perfect: true }, { id: 5 }] }, shiny)).toBe(true);
  expect(readPresets(writePresets([shiny]))).toEqual([shiny]);
  expect(readPresets(writePresets([{ ...shiny, type: '', allBonuses: true }]))[0].allBonuses).toBe(true);
  expect(readPresets(writePresets([{ ...preset, type: 'axe', allBonuses: true }]))).toEqual([]);
});

test('grades two distinct matching bonuses only when the required main type matches', () => {
  expect(presetMatchLevel(relic, preset)).toBe(3);
  expect(presetMatchLevel({ type: 'greataxe', sub_stats: [{ id: 5 }, { id: 9 }] }, preset)).toBe(2);
  expect(presetMatchLevel({ ...relic, type: 'horseshoe' }, preset)).toBe(0);
  expect(presetMatchLevel({ type: 'horseshoe', sub_stats: [{ id: 5, perfect: true }, { id: 24 }] }, { ...preset, shinyOnly: true })).toBe(0);
  expect(presetMatchLevel({ type: 'greataxe', sub_stats: [{ id: 9 }, { id: 10 }] }, preset)).toBe(0);
  expect(presetMatchLevel({ type: 'greataxe', sub_stats: [{ id: 3 }, { id: 9 }] }, { ...preset, substats: ['24', '33'] })).toBe(2);
  expect(presetMatchLevel(relic, { ...preset, enabled: false })).toBe(0);
  expect(presetMatchLevel(relic, { ...preset, shinyOnly: true })).toBe(0);
  expect(presetMatchLevel({ type: 'greataxe', sub_stats: [{ id: 5, perfect: true }, { id: 9 }] }, { ...preset, shinyOnly: true })).toBe(2);
  expect(presetMatchLevel(relic, { ...preset, substats: [] })).toBe(3);
  expect(presetMatchLevel({ type: 'horseshoe', sub_stats: [{ id: 5 }] }, { ...preset, type: '' })).toBe(0);
});

test('grades economy using all three actual bonus slots rather than the pool size', () => {
  const economy = { ...preset, type: '', substats: ['14', '15', '16', '13', 'barracks-cost'], allBonuses: true };
  expect(presetMatchLevel({ type: 'axe', sub_stats: [{ id: 14 }, { id: 16 }] }, economy)).toBe(3);
  expect(presetMatchLevel({ type: 'greataxe', sub_stats: [{ id: 14 }, { id: 15 }] }, economy)).toBe(0);
  expect(presetMatchLevel({ type: 'unknown', sub_stats: [{ id: 14 }, { id: 15 }] }, economy)).toBe(0);
  expect(presetMatchLevel({ type: 'axe', sub_stats: [{ id: 14 }, { id: 24 }] }, economy)).toBe(2);
  expect(presetMatchLevel({ type: 'axe', sub_stats: [{ id: 24 }, { id: 26 }] }, economy)).toBe(0);
  expect(presetMatchLevel({ type: 'axe', sub_stats: [{ id: 14 }] }, economy)).toBe(0);
});

test('light-cavalry defaults do not accidentally match the archer-world dropdown label for ID 26', () => {
  const light = { ...preset, substats: ['24', 'light-attack'] };
  expect(matchesPreset({ ...relic, sub_stats: [{ id: 24 }, { id: 5, name: 'Leichte Kavallerie: +2% Angriffs- und Verteidigungsstärke' }] }, light)).toBe(true);
  expect(matchesPreset({ ...relic, sub_stats: [{ id: 24 }, { id: 26, name: 'Berittener Bogenschütze: +2% Angriffsstärke' }] }, light)).toBe(false);
  expect(matchesPreset({ ...relic, sub_stats: [{ id: 24 }, { id: 26, name: 'Leichte Kavallerie: +2% Angriffsstärke' }] }, light)).toBe(true);
  expect(matchesPreset({ type: 'longbow', sub_stats: [{ id: 4 }, { id: 6 }] }, { ...preset, type: 'longbow', substats: ['25', '36'] })).toBe(true);
});

test('custom archer-world conditions use the current catalog rather than another world numeric mapping', () => {
  const labels = new Map([
    ['5', 'Leichte Kavallerie: +x% Angriffs- und Verteidigungsstärke'],
    ['6', 'Berittener Bogenschütze: +x% Angriffs- und Verteidigungsstärke'],
    ['26', 'Berittener Bogenschütze: +x% Angriffsstärke']
  ]);
  const archer = { ...preset, type: '', substats: ['26'] };
  expect(matchesPreset({ type: 'greataxe', sub_stats: [{ id: 5 }] }, archer, labels)).toBe(false);
  expect(matchesPreset({ type: 'greataxe', sub_stats: [{ id: 6 }] }, archer, labels)).toBe(true);
  expect(matchesPreset({ type: 'greataxe', sub_stats: [{ id: 26, name: 'Leichte Kavallerie: +2% Angriffsstärke' }] }, archer, labels)).toBe(false);
});
