export type RelicImage = { type: string; quality: string };

export function parseRelicImage(src: string): RelicImage | null {
  const filename = src.split('/').pop()?.split(/[?#]/)[0] || '';
  const match = filename.match(/^(.+)_(shoddy|polished|refined|superior|renowned)(?:_[^.]+)?\.(?:webp|png|jpg)$/i);
  return match ? { type: match[1].toLowerCase(), quality: match[2].toLowerCase() } : null;
}

export function upgradePreviewMode(slots: (RelicImage | null)[]): 'incomplete' | 'quality-mismatch' | 'retained' | 'random' {
  if (slots.length !== 3 || slots.some(slot => !slot)) return 'incomplete';
  const relics = slots as RelicImage[];
  if (!relics.every(relic => relic.quality === relics[0].quality)) return 'quality-mismatch';
  return relics.every(relic => relic.type === relics[0].type) ? 'retained' : 'random';
}
