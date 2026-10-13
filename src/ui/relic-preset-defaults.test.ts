import { DEFAULT_PRESETS, seedDefaultPresets } from './relic-preset-defaults';
import { installedDefaultIds, readPresets, writePresets } from './relic-preset-model';

test('adds seven defaults once while preserving edits, disabled rules and intentional deletions', () => {
  const original = { id: 'mine', name: 'Mein Preset', enabled: false, type: 'greataxe', substats: ['24'] };
  const first = seedDefaultPresets([original], []);
  expect(first.presets).toHaveLength(8);
  expect(first.presets[0]).toBe(original);
  const changed = first.presets.filter(p => p.id !== DEFAULT_PRESETS[0].id).map(p => ({ ...p, enabled: false }));
  const raw = writePresets(changed, first.installed);
  expect(seedDefaultPresets(readPresets(raw), installedDefaultIds(raw)).presets).toEqual(changed);
});
