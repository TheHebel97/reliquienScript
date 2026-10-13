import { Choice, RelicRecord } from './relic-search-model';

export interface SortField {
  id: string; label: string;
  value?: (relic: RelicRecord) => string | number | undefined;
}
export interface SortState { field: string; descending: boolean }
export const defaultSort = (): SortState => ({ field: 'standard', descending: false });

// The game only supplies formatted bonus text. Extract one unambiguous percentage
// and compare numbers; reductions use magnitude so -10% costs is stronger than -2%.
export function substatStrength(name: string): number | undefined {
  const values = name.match(/[+\-−]?\s*\d+(?:[.,]\d+)*\s*%/g);
  if (values?.length !== 1) return undefined;
  const number = values[0].replace(/[%\s+\-−]/g, '');
  const normalized = number.includes(',') ? number.replace(/\./g, '').replace(',', '.') : number;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

export function relicSortFields(types: Choice[], substats: Choice[] = []): SortField[] {
  const typeNames = new Map(types.map(t => [t.value, t.label]));
  const qualities = ['shoddy', 'polished', 'refined', 'superior', 'renowned'];
  return [
    { id: 'standard', label: 'Standard' },
    { id: 'quality', label: 'Qualität', value: r => { const rank = qualities.indexOf(r.quality); return rank < 0 ? undefined : rank; } },
    { id: 'type', label: 'Typ', value: r => typeNames.get(r.type) || r.type },
    { id: 'range', label: 'Bereich', value: r => r.range },
    { id: 'shiny', label: 'Shiny-Substats', value: r => r.sub_stats.filter(s => s.perfect === true).length },
    ...substats.map(stat => ({
      id: `substat:${stat.value}`, label: stat.label.replace(/[+\-]?x%\s*/g, '').trim(),
      value: (r: RelicRecord) => {
        const values = r.sub_stats.filter(s => String(s.id) === stat.value)
          .map(s => substatStrength(s.name)).filter((v): v is number => v !== undefined);
        return values.length ? Math.max(...values) : undefined;
      }
    }))
  ];
}

// Sort a copy; ties retain native order even when descending. Missing values stay last.
export function sortRelics<T extends RelicRecord>(items: T[], state: SortState, fields: SortField[]): T[] {
  const value = fields.find(f => f.id === state.field)?.value;
  if (!value) return items.slice();
  const collator = new Intl.Collator('de', { sensitivity: 'base' });
  const missing = (v: string | number | undefined) => v === undefined || (typeof v === 'number' && !Number.isFinite(v));
  return items.map((item, index) => ({ item, index, key: value(item) })).sort((a, b) => {
    if (missing(a.key) || missing(b.key)) return Number(missing(a.key)) - Number(missing(b.key)) || a.index - b.index;
    const diff = typeof a.key === 'number' && typeof b.key === 'number'
      ? a.key - b.key : collator.compare(String(a.key), String(b.key));
    return (state.descending ? -diff : diff) || a.index - b.index;
  }).map(entry => entry.item);
}
