export interface RelicRecord {
  name: string; type: string; quality: string;
  range?: number;
  main_stat: { name: string };
  sub_stats: Array<{ id: string | number; name: string; perfect?: boolean }>;
}
export interface Choice { value: string; label: string }
export interface SearchCatalog { qualities: Choice[]; types: Choice[] }
export interface SearchState {
  query: string; qualities: string[]; types: string[]; substats: string[];
  effects: string[]; targets: string[]; allSubstats: boolean; shiny: 'all' | 'yes' | 'no';
}
export const emptySearch = (): SearchState => ({ query: '', qualities: [], types: [], substats: [], effects: [], targets: [], allSubstats: false, shiny: 'all' });
export const normalize = (text: string): string => text.toLowerCase().replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss').replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u');
const aliases: Record<string, string> = { off: 'angriff', def: 'verteidigung', kosten: 'kosten', speed: 'geschwindigkeit', rekrutierung: 'rekrutier', lk: 'leichte kavallerie', sk: 'schwere kavallerie', kata: 'katapult' };
export function parseSearch(query: string, catalog: SearchCatalog) {
  const result = { qualities: [] as string[], types: [] as string[], shiny: 'all' as SearchState['shiny'], terms: [] as string[], excluded: [] as string[], recognized: [] as string[] };
  const tokens = query.match(/-?"[^"]+"|\S+/g) || [];
  for (let i = 0; i < tokens.length; i++) {
    const raw = tokens[i];
    let word = normalize(raw.replace(/"/g, ''));
    if (['ohne', 'kein', 'keine', 'nicht'].includes(word) && ['shiny', 'shinys', 'pink'].includes(normalize(tokens[i + 1] || ''))) {
      result.shiny = 'no'; result.recognized.push(raw + ' ' + tokens[++i]); continue;
    }
    if (['shiny', 'shinys', 'pink', '-shiny'].includes(word)) {
      result.shiny = word === '-shiny' ? 'no' : 'yes'; result.recognized.push(raw); continue;
    }
    if (['nur', 'mit', 'und', 'oder', 'reliquien'].includes(word)) continue;
    let found = false;
    for (const group of ['qualities', 'types'] as const) {
      const choice = catalog[group].find(c => normalize(c.value) === word || normalize(c.label) === word ||
        (group === 'qualities' && normalize(c.label).replace(/e$/, '') === word.replace(/(?:en|er|es|e)$/, '')));
      if (choice) { result[group].push(choice.value); result.recognized.push(raw); found = true; break; }
    }
    if (found) continue;
    const exclude = word.startsWith('-');
    if (exclude) word = word.slice(1);
    (exclude ? result.excluded : result.terms).push(aliases[word] || word);
  }
  return result;
}
export function matchesRelic(relic: RelicRecord, state: SearchState, parsed: ReturnType<typeof parseSearch>): boolean {
  const text = normalize([relic.name, relic.type, relic.main_stat.name, ...relic.sub_stats.map(s => s.name)].join(' '));
  const any = (selected: string[], value: string) => !selected.length || selected.includes(value);
  const shiny = relic.sub_stats.some(s => s.perfect === true);
  const shinyMatch = (mode: SearchState['shiny']) => mode === 'all' || shiny === (mode === 'yes');
  const subMatch = (id: string) => relic.sub_stats.some(s => String(s.id) === id);
  return any(state.qualities, relic.quality) && any(parsed.qualities, relic.quality) &&
    any(state.types, relic.type) && any(parsed.types, relic.type) && shinyMatch(state.shiny) && shinyMatch(parsed.shiny) &&
    (!state.substats.length || (state.allSubstats ? state.substats.every(subMatch) : state.substats.some(subMatch))) &&
    (!state.effects.length || state.effects.some(t => text.includes(normalize(t)))) &&
    (!state.targets.length || state.targets.some(t => text.includes(normalize(t)))) &&
    parsed.terms.every(t => text.includes(t)) && !parsed.excluded.some(t => text.includes(t));
}
