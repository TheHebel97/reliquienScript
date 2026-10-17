import { DEFAULT_PRESETS, seedDefaultPresets } from './relic-preset-defaults';
import { installedDefaultIds, readPresets, writePresets } from './relic-preset-model';

test('adds three pools once while preserving edits, disabled rules and intentional deletions', () => {
  const original = { id: 'mine', name: 'Mein Preset', enabled: false, type: 'greataxe', substats: ['24'] };
  const first = seedDefaultPresets([original], []);
  expect(first.presets).toHaveLength(4);
  expect(first.presets[0]).toBe(original);
  const changed = first.presets.filter(p => p.id !== DEFAULT_PRESETS[0].id).map(p => ({ ...p, enabled: false }));
  const raw = writePresets(changed, first.installed);
  expect(seedDefaultPresets(readPresets(raw), installedDefaultIds(raw)).presets).toEqual(changed);
});

test('keeps edited and Shiny-only legacy rules rather than replacing their conditions', () => {
  const legacy = { id: 'default:axe-off', name: 'Axt · Axt + LK Angriff', type: 'greataxe', enabled: false, shinyOnly: true, substats: ['24', '26'] };
  const edited = { id: 'default:light-off', name: 'Mein LK-Preset', type: 'shortspear', enabled: true, substats: ['24', '9'] };
  const result = seedDefaultPresets([legacy, edited], DEFAULT_PRESETS.map(p => p.id));
  expect(result.presets).toHaveLength(2);
  expect(result.presets[0]).toBe(legacy);
  expect(result.presets[1]).toBe(edited);
});

test('replaces untouched legacy combinations with pools while respecting disabled and deleted groups', () => {
  const old = [
    { id: 'default:axe-off', name: 'Axt · Axt + LK Angriff', type: 'greataxe', substats: ['24', '26'], enabled: true },
    { id: 'default:spear-heavy-def', name: 'Speer · SK + Speer Def', type: 'halberd', substats: ['37', '31'], enabled: false },
    { ...DEFAULT_PRESETS[2], enabled: false }
  ];
  const installed = ['default:axe-off', 'default:light-off', 'default:spear-heavy-def', 'default:heavy-spear-def', 'default:sword-spear-def', 'default:spear-sword-def', 'default:economy'];
  const migrated = seedDefaultPresets(old, installed);
  expect(migrated.presets).toHaveLength(3);
  expect(migrated.presets.find(p => p.id === 'default:offence')).toMatchObject({ enabled: true, allBonuses: true });
  expect(migrated.presets.find(p => p.id === 'default:defence')).toMatchObject({ enabled: false, allBonuses: true });
  expect(migrated.presets.find(p => p.id === 'default:economy')!.enabled).toBe(false);
  expect(seedDefaultPresets(migrated.presets, migrated.installed)).toEqual(migrated);
  const removed = seedDefaultPresets([], installed);
  expect(removed.presets).toHaveLength(2);
  expect(removed.presets.every(p => !p.enabled)).toBe(true);
});
