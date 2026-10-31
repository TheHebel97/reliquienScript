import { Choice, RelicRecord } from './relic-search-model';

export interface RelicStack {
  representative: RelicRecord;
  count: number;
  relics: RelicRecord[];
}

// Native inventory contract since October 2026. The grid owns pagination and
// derives eligible records/stacks lazily, including offered/equipped/slot rules.
export interface RelicInventory {
  grid: {
    page: number;
    per_page: number;
    filters: Record<string, unknown>;
    matchesFilters(relic: RelicRecord): boolean;
    hasFilters(): boolean;
    getIncludedRelics(): RelicRecord[];
    getFilteredRelics(): RelicRecord[];
    getStacks(): RelicStack[];
    getMaxPage(): number;
    setPage(page: number): void;
  };
  updateUI(): void;
  RelicsGridPanel: { deselectRelic(): void };
}

export function readRelicCatalog(): { qualities: Choice[]; types: Choice[]; substats: Choice[] } {
  const options = (selector: string): Choice[] => Array.from(document.querySelectorAll<HTMLOptionElement>(selector))
    .filter(option => option.value && option.value !== 'null')
    .map(option => ({ value: option.value, label: option.textContent || option.value }));
  const slots = options('#inventory_filter_slot1 option, #inventory_filter_slot2 option');
  const choices = (legacyId: string, prefix: string): Choice[] => {
    const legacy = options(`#${legacyId} option`);
    const values = legacy.length ? legacy : slots.filter(option => option.value.startsWith(prefix))
      .map(option => ({ ...option, value: option.value.slice(prefix.length) }));
    return Array.from(new Map(values.filter(option => option.value).map(option => [option.value, option])).values());
  };
  return {
    qualities: choices('inventory_filter_quality', 'q:'),
    types: choices('inventory_filter_type', 't:'),
    substats: choices('inventory_filter_sub1', 's:')
  };
}
