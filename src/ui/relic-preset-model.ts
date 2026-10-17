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
export const DEFAULT_PARTIAL_COLOR = '#e69732';
export function presetColor(raw: string | null, partial = false): string {
  const fallback = partial ? DEFAULT_PARTIAL_COLOR : DEFAULT_PRESET_COLOR;
  try {
    const color = JSON.parse(raw || 'null')?.[partial ? 'partialColor' : 'color'];
    return typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : fallback;
  } catch { return fallback; }
}

export const MAIN_BONUSES: Record<string, string> = {
  halberd: '1', longsword: '2', greataxe: '3', shortspear: '5', banner: '7',
  bonfire: '8', morningstar: '9', dummy: '10', horseshoe: '11', wheel: '12',
  backpack: 'barracks-cost', chisel: '14', axe: '15', pickaxe: '16',
  saddle: 'stable-cost', handsaw: 'workshop-cost', longbow: '4', shortbow: '6'
};
const COMBINED: Record<string, string> = {
  '22': '1', '31': '1', '23': '2', '32': '2', '24': '3', '33': '3',
  '26': '5', '35': '5', '28': '7', '37': '7',
  '25': '4', '34': '4', '27': '6', '36': '6'
};
type BonusLabels = ReadonlyMap<string, string>;
function unitBonus(label: string | undefined): { unit: string; kind: string } | undefined {
  const parts = label?.match(/^([^:]+):.*?(Angriffs- und Verteidigungsstärke|Angriffsstärke|Verteidigungsstärke)/i);
  return parts ? { unit: parts[1].toLowerCase(), kind: parts[2].toLowerCase() } : undefined;
}
function accepts(actual: { id: string | number; name?: string }, wanted: string, labels?: BonusLabels): boolean {
  const id = String(actual.id);
  // The archer-world dropdown labels ID 26 as mounted archers. Defaults must
  // request light cavalry semantically, without accepting that other unit.
  if (wanted === 'light-attack') {
    const label = actual.name || labels?.get(id);
    if (label) return /^Leichte Kavallerie:.*Angriff/i.test(label);
    return id === '5' || id === '26';
  }
  // Resolve this world's displayed unit conditions before using numeric
  // fallbacks: the native catalog can disagree with another world's labels.
  const wantedUnit = unitBonus(labels?.get(wanted));
  if (wantedUnit) {
    const actualUnit = unitBonus(actual.name || labels?.get(id));
    if (actualUnit) return actualUnit.unit === wantedUnit.unit &&
      (actualUnit.kind === wantedUnit.kind || actualUnit.kind === 'angriffs- und verteidigungsstärke');
  }
  if (id === wanted) return true;
  if (wanted === 'barracks-cost') return /(?:rekrutierungskosten.*kaserne|kaserne.*rekrutierungskosten)/i.test(actual.name || '');
  return COMBINED[wanted] === id;
}

function presetScore(relic: PresetRelic, preset: RelicPreset, labels?: BonusLabels): { hits: number; required: number } {
  const none = { hits: 0, required: 3 };
  if (!preset.enabled || (!preset.type && !preset.substats.length)) return none;
  const stats = relic.sub_stats || [];
  if (preset.shinyOnly && !stats.some(stat => stat.perfect === true)) return none;
  if (preset.allBonuses) {
    const main = MAIN_BONUSES[relic.type];
    if (stats.length !== 2) return none;
    const mainHit = !!main && preset.substats.some(wanted => accepts({ id: main }, wanted, labels));
    if (!mainHit) return none;
    return { hits: 1 + stats.filter(stat => preset.substats.some(wanted => accepts(stat, wanted, labels))).length, required: 3 };
  }
  // A partial match can relax a substat condition, never the selected main type.
  if (preset.type && relic.type !== preset.type) return none;
  // Each condition needs its own stat; a combined bonus must not fill two slots.
  const match = (index: number, used: Set<number>): number => {
    if (index === preset.substats.length) return 0;
    let best = match(index + 1, used);
    stats.forEach((stat, slot) => {
      if (!used.has(slot) && accepts(stat, preset.substats[index], labels)) {
        best = Math.max(best, 1 + match(index + 1, new Set([...used, slot])));
      }
    });
    return best;
  };
  return { hits: Number(!!preset.type && relic.type === preset.type) + match(0, new Set()), required: Number(!!preset.type) + preset.substats.length };
}

export function matchesPreset(relic: PresetRelic, preset: RelicPreset, labels?: BonusLabels): boolean {
  const score = presetScore(relic, preset, labels);
  return score.hits === score.required;
}

// Shorter custom rules still require all their conditions; partial matching is
// for a three-bonus combination only, never a mixture of different presets.
export function presetMatchLevel(relic: PresetRelic, preset: RelicPreset, labels?: BonusLabels): 0 | 2 | 3 {
  const score = presetScore(relic, preset, labels);
  if (score.hits === score.required) return 3;
  return score.required === 3 && score.hits === 2 ? 2 : 0;
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

export function writePresets(presets: RelicPreset[], installedDefaults: string[] = [], color = DEFAULT_PRESET_COLOR, partialColor = DEFAULT_PARTIAL_COLOR): string {
  return JSON.stringify({ version: 2, presets, installedDefaults, color, partialColor });
}
