export interface RelicPreset {
  id: string;
  name: string;
  enabled: boolean;
  type: string;
  substats: string[];
  allBonuses?: boolean;
  shinyOnly?: boolean;
}

export interface PresetRelic {
  type: string;
  sub_stats?: Array<{ id: string | number; name?: string; perfect?: boolean }>;
}

export const DEFAULT_PRESET_COLOR = '#d2d51b';
export function presetColor(raw: string | null): string {
  try {
    const color = JSON.parse(raw || 'null')?.color;
    return typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : DEFAULT_PRESET_COLOR;
  } catch { return DEFAULT_PRESET_COLOR; }
}

export const MAIN_BONUSES: Record<string, string> = {
  halberd: '1', longsword: '2', greataxe: '3', shortspear: '5', banner: '7',
  bonfire: '8', morningstar: '9', dummy: '10', horseshoe: '11', wheel: '12',
  backpack: 'barracks-cost', chisel: '14', axe: '15', pickaxe: '16',
  saddle: 'stable-cost', handsaw: 'workshop-cost'
};
const COMBINED: Record<string, string> = {
  '22': '1', '31': '1', '23': '2', '32': '2', '24': '3', '33': '3',
  '26': '5', '35': '5', '28': '7', '37': '7'
};
function accepts(actual: { id: string | number; name?: string }, wanted: string): boolean {
  const id = String(actual.id);
  if (id === wanted) return true;
  if (wanted === 'barracks-cost') return /(?:rekrutierungskosten.*kaserne|kaserne.*rekrutierungskosten)/i.test(actual.name || '');
  return COMBINED[wanted] === id;
}

export function matchesPreset(relic: PresetRelic, preset: RelicPreset): boolean {
  if (!preset.enabled || (!preset.type && !preset.substats.length)) return false;
  const stats = relic.sub_stats || [];
  if (preset.shinyOnly && !stats.some(stat => stat.perfect === true)) return false;
  if (preset.allBonuses) {
    const main = MAIN_BONUSES[relic.type];
    return stats.length === 2 && !!main && preset.substats.some(wanted => accepts({ id: main }, wanted)) &&
      stats.every(stat => preset.substats.some(wanted => accepts(stat, wanted)));
  }
  if (preset.type && relic.type !== preset.type) return false;
  // Each condition needs its own stat; a combined bonus must not fill two slots.
  const match = (index: number, used: Set<number>): boolean => index === preset.substats.length ||
    stats.some((stat, slot) => !used.has(slot) && accepts(stat, preset.substats[index]) &&
      match(index + 1, new Set([...used, slot])));
  return match(0, new Set());
}

// Reject a malformed rule as a whole: dropping one condition would broaden it.
export function readPresets(raw: string | null): RelicPreset[] {
  try {
    const data: unknown = JSON.parse(raw || 'null');
    if (!data || typeof data !== 'object') return [];
    const stored = data as { version?: unknown; presets?: unknown };
    if ((stored.version !== 1 && stored.version !== 2) || !Array.isArray(stored.presets)) return [];
    const result: RelicPreset[] = [];
    stored.presets.forEach(value => {
      if (!value || typeof value !== 'object') return;
      const p = value as Partial<RelicPreset>;
      if (typeof p.id !== 'string' || !p.id.trim() || result.some(item => item.id === p.id) ||
        typeof p.name !== 'string' || !p.name.trim() || p.name.length > 80 ||
        typeof p.enabled !== 'boolean' || typeof p.type !== 'string' ||
        !Array.isArray(p.substats) || p.substats.some(id => typeof id !== 'string' || !id.trim()) ||
        new Set(p.substats).size !== p.substats.length || (!p.type && !p.substats.length) ||
        (p.allBonuses !== undefined && typeof p.allBonuses !== 'boolean') ||
        (p.shinyOnly !== undefined && typeof p.shinyOnly !== 'boolean') || (p.allBonuses && (p.type || !p.substats.length))) return;
      result.push({ id: p.id, name: p.name.trim(), enabled: p.enabled, type: p.type, substats: p.substats.slice(),
        ...(p.allBonuses === undefined ? {} : { allBonuses: p.allBonuses }),
        ...(p.shinyOnly === undefined ? {} : { shinyOnly: p.shinyOnly }) });
    });
    return result;
  } catch { return []; }
}

export function installedDefaultIds(raw: string | null): string[] {
  try {
    const data = JSON.parse(raw || 'null');
    return data?.version === 2 && Array.isArray(data.installedDefaults) && data.installedDefaults.every((id: unknown) => typeof id === 'string') ? data.installedDefaults : [];
  } catch { return []; }
}

export function writePresets(presets: RelicPreset[], installedDefaults: string[] = [], color = DEFAULT_PRESET_COLOR): string {
  return JSON.stringify({ version: 2, presets, installedDefaults, color });
}
