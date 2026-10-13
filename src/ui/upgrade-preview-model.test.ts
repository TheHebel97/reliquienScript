import { parseRelicImage, upgradePreviewMode } from './upgrade-preview-model';

const saw = { type: 'handsaw', quality: 'shoddy' };
const shoe = { type: 'horseshoe', quality: 'shoddy' };
test('extracts type/quality from a relic image but excludes placeholders', () => {
  expect(parseRelicImage('https://example.com/relics_184/handsaw_shoddy.webp')).toEqual(saw);
  expect(parseRelicImage('placeholder_relic_to_upgrade.png')).toBeNull();
});
test('requires three complete slots', () => {
  expect(upgradePreviewMode([saw, saw, null])).toBe('incomplete');
});
test('retains first relic stats only with three matching types', () => {
  expect(upgradePreviewMode([saw, saw, saw])).toBe('retained');
  expect(upgradePreviewMode([saw, shoe, saw])).toBe('random');
  expect(upgradePreviewMode([saw, shoe, { type: 'wheel', quality: 'shoddy' }])).toBe('random');
});
test('does not promise an upgrade for different qualities', () => {
  expect(upgradePreviewMode([saw, saw, { ...saw, quality: 'polished' }])).toBe('quality-mismatch');
});
