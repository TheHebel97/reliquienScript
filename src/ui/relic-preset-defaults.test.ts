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

test('migrates the original light-cavalry condition without restoring deleted or edited defaults', () => {
  const legacy = { ...DEFAULT_PRESETS[0], enabled: false, shinyOnly: true, substats: ['24', '26'] };
  const edited = { ...DEFAULT_PRESETS[1], substats: ['24', '9'] };
  const result = seedDefaultPresets([legacy, edited], DEFAULT_PRESETS.map(p => p.id));
  expect(result.presets).toHaveLength(2);
  expect(result.presets[0]).toEqual({ ...legacy, substats: ['24', 'light-attack'] });
  expect(result.presets[1]).toBe(edited);
});
