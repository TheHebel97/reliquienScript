import { parseRelicImage, upgradePreviewMode } from './upgrade-preview-model';

export function installUpgradePreview(): void {
  const panel = document.getElementById('upgrade_panel');
  const slots = document.getElementById('relics_to_upgrade');
  if (!panel || !slots || document.getElementById('relic-upgrade-preview')) return;

  const preview = document.createElement('section');
  preview.id = 'relic-upgrade-preview';
  preview.setAttribute('aria-label', 'Aufwertungsvorschau');
  preview.setAttribute('aria-live', 'polite');
  panel.appendChild(preview);
  const style = document.createElement('style');
  style.textContent = `
    #relic-upgrade-preview { border-top: 1px solid #c8b58e; padding-top: 8px; min-width: 0; font-size: 11px; }
    #relic-upgrade-preview > strong { display: block; color: #6e593b; margin-bottom: 5px; }
    #relic-upgrade-preview > p { margin: 4px 0 7px; }
    #relic-upgrade-preview .relic-details { margin: 0; width: 100%; min-width: 0; box-sizing: border-box; overflow-wrap: anywhere; }
    #relic-upgrade-preview .header { display: flex; align-items: flex-start; gap: 4px; }
    #relic-upgrade-preview .description { flex: 1; min-width: 0; }
    #relic-upgrade-preview .image { flex: 0 0 40px; }
    #relic-upgrade-preview .image img { width: 40px; height: 40px; }
  `;
  document.head.appendChild(style);

  const firstSlotImage = (): string => (document.getElementById('relics_to_upgrade_0') as HTMLImageElement | null)?.src || '';
  let baseDetails: HTMLElement | null = null;
  let baseImage = '';

  // Capture before the game's click handler clears the selected detail view.
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('#relics_to_upgrade_remove_0')) {
      baseDetails = null;
      baseImage = '';
    }
    if (!event.target.closest('#add_relic_to_upgrade_panel_button') || parseRelicImage(firstSlotImage())) return;
    const details = document.querySelector<HTMLElement>('#selected_relic_details .relic-details');
    if (!details) return;
    baseImage = details.querySelector<HTMLImageElement>('.image img')?.src || '';
    baseDetails = details.cloneNode(true) as HTMLElement;
    // Preserve pink/shiny colors even when the game's CSS is scoped to the selection.
    const originalStats = details.querySelectorAll<HTMLElement>('.sub_stats, .sub_stats *');
    const copiedStats = baseDetails.querySelectorAll<HTMLElement>('.sub_stats, .sub_stats *');
    originalStats.forEach((original, index) => {
      copiedStats[index].style.color = getComputedStyle(original).color;
    });
    baseDetails.querySelectorAll('.buttons, script, iframe').forEach(node => node.remove());
    [baseDetails, ...Array.from(baseDetails.querySelectorAll<HTMLElement>('*'))].forEach(node => {
      node.removeAttribute('id');
      Array.from(node.attributes).filter(attribute => attribute.name.startsWith('on'))
        .forEach(attribute => node.removeAttribute(attribute.name));
    });
  }, true);

  const render = (): void => {
    const images = [0, 1, 2].map(index => (document.getElementById(`relics_to_upgrade_${index}`) as HTMLImageElement | null)?.src || '');
    const relics = images.map(parseRelicImage);
    if (!relics[0] || images[0] !== baseImage) baseDetails = null;
    const mode = upgradePreviewMode(relics);
    const count = relics.filter(Boolean).length;
    preview.hidden = count === 0;
    if (!count) { preview.replaceChildren(); return; }
    const heading = document.createElement('strong');
    preview.replaceChildren(heading);
    if (mode === 'incomplete') {
      heading.textContent = `Aufwertung · ${count}/3`;
    } else if (mode === 'quality-mismatch') {
      heading.textContent = 'Qualität passt nicht';
    } else if (mode === 'random') {
      heading.textContent = 'Zufallsaufwertung';
    } else {
      heading.textContent = 'Basiswerte · Substats bleiben';
    }
    if ((mode === 'retained' || mode === 'incomplete') && relics[0]) {
      if (baseDetails) preview.appendChild(baseDetails.cloneNode(true));
      else {
        const missing = document.createElement('p');
        missing.textContent = 'Basisdetails nicht verfügbar.';
        preview.appendChild(missing);
      }
    }
  };
  // Observe only game-owned slots, so rendering the preview cannot trigger itself.
  const observer = new MutationObserver(render);
  observer.observe(slots, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
  render();
}
