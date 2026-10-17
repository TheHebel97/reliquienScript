import { RelicPreset } from './relic-preset-model';

export const DEFAULT_PRESETS: RelicPreset[] = [
  { id: 'default:axe-off', name: 'Axt · Axt + LK Angriff', enabled: true, type: 'greataxe', substats: ['24', 'light-attack'] },
  { id: 'default:light-off', name: 'LK · Axt + LK Angriff', enabled: true, type: 'shortspear', substats: ['24', 'light-attack'] },
  { id: 'default:spear-heavy-def', name: 'Speer · SK + Speer Def', enabled: true, type: 'halberd', substats: ['37', '31'] },
  { id: 'default:heavy-spear-def', name: 'SK · Speer + SK Def', enabled: true, type: 'banner', substats: ['31', '37'] },
  { id: 'default:sword-spear-def', name: 'Schwert · Schwert + Speer Def', enabled: true, type: 'longsword', substats: ['32', '31'] },
  { id: 'default:spear-sword-def', name: 'Speer · Schwert + Speer Def', enabled: true, type: 'halberd', substats: ['32', '31'] },
  { id: 'default:economy', name: 'Rohstoffe & Beute', enabled: true, type: '', substats: ['15', '16', '14', 'barracks-cost', '13'], allBonuses: true }
];

export function seedDefaultPresets(presets: RelicPreset[], installed: string[]): { presets: RelicPreset[]; installed: string[] } {
  const next = presets.map(preset => {
    const original = DEFAULT_PRESETS.find(p => p.id === preset.id);
    // Upgrade only the original condition pair; preserve custom edits and the
    // user's enabled/name/shiny settings. Deleted defaults stay deleted.
    if (original && ['default:axe-off', 'default:light-off'].includes(preset.id) &&
      preset.type === original.type && !preset.allBonuses &&
      preset.substats.length === 2 && preset.substats.includes('24') && preset.substats.includes('26')) {
      return { ...preset, substats: original.substats.slice() };
    }
    return preset;
  });
  DEFAULT_PRESETS.forEach(preset => {
    if (!installed.includes(preset.id) && !next.some(p => p.id === preset.id)) next.push({ ...preset, substats: preset.substats.slice() });
  });
  return { presets: next, installed: Array.from(new Set([...installed, ...DEFAULT_PRESETS.map(p => p.id)])) };
}
