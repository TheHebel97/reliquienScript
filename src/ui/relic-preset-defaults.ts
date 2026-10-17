import { RelicPreset } from './relic-preset-model';

const LEGACY_COMBAT_PRESETS: RelicPreset[] = [
  { id: 'default:axe-off', name: 'Axt · Axt + LK Angriff', enabled: true, type: 'greataxe', substats: ['24', 'light-attack'] },
  { id: 'default:light-off', name: 'LK · Axt + LK Angriff', enabled: true, type: 'shortspear', substats: ['24', 'light-attack'] },
  { id: 'default:spear-heavy-def', name: 'Speer · SK + Speer Def', enabled: true, type: 'halberd', substats: ['37', '31'] },
  { id: 'default:heavy-spear-def', name: 'SK · Speer + SK Def', enabled: true, type: 'banner', substats: ['31', '37'] },
  { id: 'default:sword-spear-def', name: 'Schwert · Schwert + Speer Def', enabled: true, type: 'longsword', substats: ['32', '31'] },
  { id: 'default:spear-sword-def', name: 'Speer · Schwert + Speer Def', enabled: true, type: 'halberd', substats: ['32', '31'] }
];

export const DEFAULT_PRESETS: RelicPreset[] = [
  { id: 'default:offence', name: 'Offensiv', enabled: true, type: '', substats: ['24', 'light-attack', '9'], allBonuses: true },
  { id: 'default:defence', name: 'Defensiv', enabled: true, type: '', substats: ['31', '32', '37'], allBonuses: true },
  { id: 'default:economy', name: 'Rohstoffe & Beute', enabled: true, type: '', substats: ['15', '16', '14', 'barracks-cost', '13'], allBonuses: true }
];

export function seedDefaultPresets(presets: RelicPreset[], installed: string[]): { presets: RelicPreset[]; installed: string[] } {
  // Replace untouched combinations with pools. Keep renamed/edited/Shiny-only
  // rules, and do not activate a pool if all its old defaults were off/deleted.
  const retired = presets.filter(preset => {
    const original = LEGACY_COMBAT_PRESETS.find(p => p.id === preset.id);
    if (!original || preset.name !== original.name || preset.type !== original.type || preset.allBonuses || preset.shinyOnly) return false;
    const normalize = (ids: string[]): string => ids.map(id => original.substats.includes('light-attack') && id === '26' ? 'light-attack' : id).sort().join(',');
    return normalize(preset.substats) === normalize(original.substats);
  });
  const next = presets.filter(preset => !retired.includes(preset));
  DEFAULT_PRESETS.forEach(preset => {
    if (installed.includes(preset.id) || next.some(p => p.id === preset.id)) return;
    const legacy = preset.id === 'default:offence' ? LEGACY_COMBAT_PRESETS.slice(0, 2) :
      preset.id === 'default:defence' ? LEGACY_COMBAT_PRESETS.slice(2) : [];
    const hadLegacy = legacy.some(p => installed.includes(p.id) || presets.some(existing => existing.id === p.id));
    const enabled = hadLegacy ? retired.some(p => p.enabled && legacy.some(old => old.id === p.id)) : preset.enabled;
    next.push({ ...preset, enabled, substats: preset.substats.slice() });
  });
  return { presets: next, installed: Array.from(new Set([...installed, ...LEGACY_COMBAT_PRESETS.map(p => p.id), ...DEFAULT_PRESETS.map(p => p.id)])) };
}
