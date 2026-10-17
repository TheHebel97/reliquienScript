import { addDockedPanel } from './docked-panels';
import { Choice } from './relic-search-model';
import { DEFAULT_PARTIAL_COLOR, DEFAULT_PRESET_COLOR, installedDefaultIds, MAIN_BONUSES, presetMatchLevel, presetColor, PresetRelic, readPresets, RelicPreset, writePresets } from './relic-preset-model';
import { seedDefaultPresets } from './relic-preset-defaults';

const WINDOW_ID = 'relic-preset-window';
const STORAGE_KEY = 'reliquiensrtipz:relic-presets';
const EDITOR_ID = 'relic-preset-editor';
declare const RelicSystem: { getRelicById(id: string): PresetRelic | undefined } | undefined;

export function installRelicPresets(): void {
  const grid = document.getElementById('relics');
  const line = document.querySelector('#relic-search .search-line');
  if (!grid || !line || document.getElementById(WINDOW_ID) || typeof RelicSystem === 'undefined') return;
  const options = (id: string): Choice[] => Array.from(document.querySelectorAll<HTMLOptionElement>(`#${id} option`))
    .filter(o => o.value && o.value !== 'null').map(o => ({ value: o.value, label: o.textContent || o.value }));
  const types = options('inventory_filter_type');
  const stats = options('inventory_filter_sub1');
  if (!types.length || !stats.length) return;
  stats.push({ value: 'barracks-cost', label: 'Kaserne: Rekrutierungskosten reduzieren' });
  stats.push({ value: 'light-attack', label: 'Leichte Kavallerie: +x% Angriffsstärke' });
  const bonusLabels = new Map(stats.map(stat => [stat.value, stat.label]));
  // Reuse this world's current asset version instead of pinning a CDN hash.
  const graphicImage = Array.from(document.images).find(image => image.src.includes('/graphic/'));
  const graphicBase = graphicImage?.src.split('/graphic/')[0];
  const units: Array<[string, string]> = [
    ['Speerträger', 'spear'], ['Schwertkämpfer', 'sword'], ['Axtkämpfer', 'axe'],
    ['Leichte Kavallerie', 'light'], ['Schwere Kavallerie', 'heavy'], ['Späher', 'spy'],
    ['Rammbock', 'ram'], ['Katapult', 'catapult'],
    ['Bogenschütze', 'archer'], ['Berittener Bogenschütze', 'marcher']
  ];
  const bonusBadge = (fullLabel: string, main = false, compact = false): HTMLElement => {
    const badge = document.createElement('span'); badge.className = 'preset-bonus';
    const mainType = main ? types.find(t => t.label === fullLabel)?.value : undefined;
    const bonusLabel = mainType ? stats.find(s => s.value === MAIN_BONUSES[mainType])?.label || fullLabel : fullLabel;
    const clean = bonusLabel.replace(/[+\-−]?x%\s*/g, '').trim();
    const unit = units.find(([label]) => clean.startsWith(`${label}:`));
    badge.title = clean; badge.setAttribute('aria-label', clean);
    let caption = clean;
    const fallback = compact ? (unit ? unit[1].slice(0, 3).toUpperCase() : '…') : clean;
    if (unit && graphicBase) {
      const image = document.createElement('img'); image.src = `${graphicBase}/graphic/unit/unit_${unit[1]}.webp`;
      image.alt = unit[0]; image.width = 18; image.height = 18;
      caption = compact ? '' : clean.slice(unit[0].length + 1).trim()
        .replace('Angriffs- und Verteidigungsstärke', 'Angr./Vert.')
        .replace('Angriffsstärke', 'Angriff').replace('Verteidigungsstärke', 'Verteidigung');
      image.addEventListener('error', () => { image.replaceWith(document.createTextNode(fallback)); }, { once: true });
      badge.append(image);
    } else if (compact) {
      badge.append(document.createTextNode(fallback));
    }
    if (compact && unit) {
      const kind = document.createElement('sup');
      kind.textContent = /Angriffs- und Verteidigungs/.test(clean) ? 'A/D' : /Angriff/.test(clean) ? 'A' : /Verteidigung/.test(clean) ? 'D' : '';
      badge.append(kind);
    } else if (caption && !compact) badge.append(document.createTextNode(caption));
    return badge;
  };
  let presets: RelicPreset[] = [];
  let installed: string[] = [];
  let color = DEFAULT_PRESET_COLOR;
  let partialColor = DEFAULT_PARTIAL_COLOR;
  let storageMessage = '';
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    color = presetColor(raw);
    partialColor = presetColor(raw, true);
    const seeded = seedDefaultPresets(readPresets(raw), installedDefaultIds(raw));
    presets = seeded.presets; installed = seeded.installed;
    localStorage.setItem(STORAGE_KEY, writePresets(presets, installed, color, partialColor));
  } catch {
    const seeded = seedDefaultPresets(presets, installed); presets = seeded.presets; installed = seeded.installed;
    storageMessage = 'Nur für diese Sitzung: Browser-Speicher nicht verfügbar.';
  }
  let editingId: string | null = null;
  let selectedStats = new Set<string>();
  const style = document.createElement('style');
  style.textContent = `
    #relics > div.relic-preset { position: relative; }
    #relics > div.relic-preset::after {
      content: ''; position: absolute; inset: 0; border: 4px solid var(--relic-preset-color, ${DEFAULT_PRESET_COLOR});
      box-sizing: border-box; pointer-events: none; z-index: 2;
      box-shadow: 0 0 0 1px #211a10 inset, 0 0 0 1px #211a10;
    }
    #relics > div.relic-preset-partial::after {
      border-color: var(--relic-preset-partial-color, ${DEFAULT_PARTIAL_COLOR});
    }
    :is(#${WINDOW_ID},#${EDITOR_ID}) { color: #412b13; font-size: 12px; }
    :is(#${WINDOW_ID},#${EDITOR_ID}).relic-dock { gap: 4px; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) [hidden] { display: none !important; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) button:not(.relic-dock-handle) { cursor: pointer; font: inherit; padding: 3px 7px; border: 1px solid #b39a6b; border-radius: 8px; color: inherit; background: #f4e4c2; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) :is(button,input,select):focus-visible { outline: 2px solid #3687ff; outline-offset: 1px; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-list { display: grid; gap: 0; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-card { display: flex; align-items: center; gap: 3px; height: 20px; border-left: 2px solid var(--relic-preset-color, ${DEFAULT_PRESET_COLOR}); padding-left: 3px; }
    #${WINDOW_ID} .preset-toolbar { display: flex; align-items: center; justify-content: space-between; min-height: 18px; }
    #${WINDOW_ID} .preset-color-label { display: flex; align-items: center; gap: 4px; font-size: 11px; }
    #${WINDOW_ID} input[type="color"] { width: 24px; height: 18px; padding: 0; border: 1px solid #ab8955; cursor: pointer; background: transparent; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-card > label { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; cursor: pointer; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-card .preset-name { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-card .preset-summary { display: flex; align-items: center; gap: 2px; margin: 0; min-width: 0; overflow: hidden; white-space: nowrap; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-card .preset-bonus { padding: 0; gap: 0; background: transparent; flex-shrink: 0; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-card sup { font-size: 8px; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-card .preset-edit { padding: 1px 4px; margin-left: auto; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-group { font-size: 10px; line-height: 12px; margin: 2px 0 0; }
    #${EDITOR_ID} { width: min(420px,calc(100vw - 48px)); max-height: calc(100vh - 80px); box-sizing: border-box; padding: 18px; border: 1px solid #ab8955; border-radius: 8px; background: #fff0cf; }
    #${EDITOR_ID}::backdrop { background: #0006; }
    #${EDITOR_ID} .preset-summary { margin-top: 8px; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-summary { display: grid; gap: 4px; font-size: 11px; margin: 5px 0; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-bonuses { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-bonus { display: inline-flex; align-items: center; gap: 3px; min-height: 18px; padding: 2px 4px; background: #f4e4c2; border-radius: 4px; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-bonus img { width: 18px; height: 18px; flex-shrink: 0; object-fit: contain; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-actions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) form { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) form > :is(strong,.preset-stat-editor,.preset-actions) { grid-column: 1 / -1; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) form > label { display: grid; gap: 3px; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) :is(input[type="text"],select) { width: 100%; box-sizing: border-box; min-width: 0; padding: 4px; color: inherit; background: #fff6df; border: 1px solid #ab8955; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-stat-editor { display: grid; gap: 4px; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-stat-picker { display: flex; gap: 5px; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-stat-picker select { flex: 1; width: 0; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-selected-stats { display: flex; flex-wrap: wrap; gap: 4px; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-selected-stats button { font-size: 11px; text-align: left; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) input[type="checkbox"] { flex-shrink: 0; margin: 1px 0; }
    :is(#${WINDOW_ID},#${EDITOR_ID}) .preset-empty, :is(#${WINDOW_ID},#${EDITOR_ID}) output { font-size: 11px; margin: 0; overflow-wrap: anywhere; }
  `;
  document.head.append(style);

  const button = (label: string, action: () => void): HTMLButtonElement => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', action); return b;
  };
  const panel = document.createElement('aside'); panel.id = WINDOW_ID; panel.hidden = true;
  panel.setAttribute('aria-label', 'Reliquien-Presets'); document.body.append(panel);
  const dock = addDockedPanel(panel, 'Presets', 57, 340);
  const trigger = button('Presets', () => setOpen(panel.hidden));
  trigger.id = 'relic-preset-trigger'; trigger.setAttribute('aria-controls', WINDOW_ID); trigger.setAttribute('aria-expanded', 'false');
  line.insertBefore(trigger, line.lastElementChild);
  function setOpen(open: boolean): void { dock.setVisible(open); trigger.setAttribute('aria-expanded', String(open)); }
  const closeButton = button('Schließen', () => { setOpen(false); trigger.focus(); });
  closeButton.className = 'relic-dock-close';
  closeButton.setAttribute('aria-label', 'Presetfenster schließen');
  const count = document.createElement('output'); count.setAttribute('aria-live', 'polite');
  const toolbar = document.createElement('div'); toolbar.className = 'preset-toolbar';
  const colorPicker = document.createElement('input'); colorPicker.type = 'color'; colorPicker.id = 'relic-preset-color'; colorPicker.value = color;
  colorPicker.setAttribute('aria-label', 'Preset-Rahmenfarbe: vollständig'); colorPicker.title = 'Volltreffer: durchgehender Rahmen (3/3)';
  const colorLabel = document.createElement('label'); colorLabel.className = 'preset-color-label';
  colorLabel.append(document.createTextNode('3/3'), colorPicker);
  const partialPicker = document.createElement('input'); partialPicker.type = 'color'; partialPicker.id = 'relic-preset-partial-color'; partialPicker.value = partialColor;
  partialPicker.setAttribute('aria-label', 'Preset-Rahmenfarbe: zwei Boni'); partialPicker.title = 'Zwei passende Boni: durchgehender Rahmen (2/3)';
  const partialLabel = document.createElement('label'); partialLabel.className = 'preset-color-label';
  partialLabel.append(document.createTextNode('2/3'), partialPicker); toolbar.append(count, colorLabel, partialLabel);
  colorPicker.addEventListener('input', () => { color = colorPicker.value; applyColor(); });
  colorPicker.addEventListener('change', () => { color = colorPicker.value; applyColor(); persist(); });
  partialPicker.addEventListener('input', () => { partialColor = partialPicker.value; applyColor(); });
  partialPicker.addEventListener('change', () => { partialColor = partialPicker.value; applyColor(); persist(); });
  const list = document.createElement('div'); list.className = 'preset-list';
  const message = document.createElement('output'); message.setAttribute('aria-live', 'polite'); message.id = 'relic-preset-message';
  const form = document.createElement('form'); form.id = 'relic-preset-form';
  form.hidden = true;
  const heading = document.createElement('strong'); heading.textContent = 'Neues Preset';
  heading.id = 'relic-preset-editor-title';
  const modal = document.createElement('dialog'); modal.id = EDITOR_ID;
  modal.setAttribute('aria-labelledby', heading.id); document.body.append(modal);
  function applyColor(): void {
    [grid!, panel, modal].forEach(element => {
      element.style.setProperty('--relic-preset-color', color);
      element.style.setProperty('--relic-preset-partial-color', partialColor);
    });
  }
  applyColor();
  let returnFocus: HTMLElement | null = null;
  const editorMessage = document.createElement('output'); editorMessage.setAttribute('aria-live', 'polite');
  const name = document.createElement('input'); name.type = 'text'; name.id = 'relic-preset-name'; name.required = true; name.maxLength = 80;
  name.placeholder = 'z. B. Axt + LK Off';
  const type = document.createElement('select'); type.id = 'relic-preset-type';
  const mode = document.createElement('select'); mode.id = 'relic-preset-mode';
  mode.innerHTML = '<option value="exact">Typ und gewünschte Substats</option><option value="all">Boni aus der Auswahl (2/3 oder 3/3)</option>';
  const shiny = document.createElement('input'); shiny.type = 'checkbox'; shiny.id = 'relic-preset-shiny';
  mode.addEventListener('change', () => { type.disabled = mode.value === 'all'; if (type.disabled) type.value = ''; });
  const label = (text: string, control: HTMLElement): HTMLLabelElement => {
    const l = document.createElement('label'); l.append(document.createTextNode(text), control); return l;
  };
  const checkboxLabel = (text: string, control: HTMLInputElement): HTMLLabelElement => {
    const l = document.createElement('label'); const caption = document.createElement('span'); caption.textContent = text;
    l.append(control, caption); return l;
  };
  const addOption = (value: string, text: string): void => {
    const option = document.createElement('option'); option.value = value; option.textContent = text; type.append(option);
  };
  addOption('', 'Beliebiger Typ'); types.forEach(choice => addOption(choice.value, choice.label));
  const statEditor = document.createElement('section'); statEditor.className = 'preset-stat-editor';
  const statSelect = document.createElement('select'); statSelect.id = 'relic-preset-substat';
  const statCaption = document.createElement('label'); statCaption.htmlFor = statSelect.id; statCaption.textContent = 'Substats';
  const emptyStat = document.createElement('option'); emptyStat.value = ''; emptyStat.textContent = 'Substat auswählen'; statSelect.append(emptyStat);
  stats.forEach(stat => { const option = document.createElement('option'); option.value = stat.value; option.textContent = stat.label; statSelect.append(option); });
  const selectedStatChips = document.createElement('div'); selectedStatChips.className = 'preset-selected-stats';
  const addStat = button('Hinzufügen', () => {
    if (!statSelect.value) return;
    selectedStats.add(statSelect.value); renderStatChoices();
  });
  addStat.id = 'relic-preset-add-substat'; addStat.disabled = true;
  statSelect.addEventListener('change', () => { addStat.disabled = !statSelect.value || selectedStats.has(statSelect.value); });
  const statPicker = document.createElement('div'); statPicker.className = 'preset-stat-picker'; statPicker.append(statSelect, addStat);
  statEditor.append(statCaption, statPicker, selectedStatChips);
  const statLabel = (id: string): string => stats.find(s => s.value === id)?.label || `Nicht verfügbar: Substat ${id}`;
  function renderStatChoices(): void {
    selectedStatChips.replaceChildren();
    selectedStats.forEach(id => {
      const text = statLabel(id).replace(/[+\-−]?x%\s*/g, '');
      const chip = button('', () => { selectedStats.delete(id); renderStatChoices(); });
      chip.append(bonusBadge(statLabel(id)), document.createTextNode(' ×'));
      chip.dataset.substat = id; chip.setAttribute('aria-label', `${text} entfernen`); selectedStatChips.append(chip);
    });
    Array.from(statSelect.options).forEach(option => { option.disabled = selectedStats.has(option.value); });
    statSelect.value = ''; addStat.disabled = true;
  }
  function resetEditor(): void {
    editingId = null; name.value = ''; type.value = ''; selectedStats = new Set(); heading.textContent = 'Neues Preset';
    type.querySelector('[data-unavailable]')?.remove(); renderStatChoices();
    mode.value = 'exact'; type.disabled = false; shiny.checked = false;
    form.hidden = true; editorMessage.textContent = '';
    if (modal.open) modal.close();
  }
  function showEditor(): void {
    returnFocus = document.activeElement as HTMLElement;
    form.hidden = false; modal.showModal(); name.focus();
  }
  modal.addEventListener('cancel', event => { event.preventDefault(); resetEditor(); returnFocus?.focus(); });
  const saveButton = document.createElement('button'); saveButton.type = 'submit'; saveButton.textContent = 'Speichern';
  const editorActions = document.createElement('div'); editorActions.className = 'preset-actions';
  editorActions.append(saveButton, button('Abbrechen', () => { resetEditor(); returnFocus?.focus(); }), button('Löschen', () => {
    if (!editingId) return;
    presets = presets.filter(p => p.id !== editingId); resetEditor(); persist(); newButton.focus();
  }));
  form.append(heading, label('Name', name), label('Regel', mode), label('Typ / Hauptbonus', type), statEditor,
    checkboxLabel('Nur Shiny-Reliquien', shiny), editorActions, editorMessage);
  modal.append(form);
  const newButton = button('Neues Preset', () => { resetEditor(); message.textContent = ''; showEditor(); });
  newButton.id = 'relic-preset-new';
  panel.append(closeButton, toolbar, list, newButton, message);
  message.textContent = storageMessage;

  const highlight = (): void => {
    let marked = 0;
    grid.querySelectorAll<HTMLImageElement>('img[data-id]').forEach(image => {
      const relic = RelicSystem!.getRelicById(image.dataset.id!);
      const matching = relic ? presets.map(preset => ({ preset, level: presetMatchLevel(relic, preset, bonusLabels) })).filter(match => match.level > 0) : [];
      const tile = image.parentElement!;
      tile.classList.toggle('relic-preset', matching.length > 0);
      const level = matching.some(match => match.level === 3) ? 3 : matching.length ? 2 : 0;
      tile.classList.toggle('relic-preset-partial', level === 2);
      if (matching.length) {
        tile.dataset.relicPresetNames = matching.map(match => `${match.preset.name} (${match.level === 3 ? 'vollständig' : '2/3'})`).join(' · ');
        tile.dataset.relicPresetLevel = String(level); marked++;
      } else { delete tile.dataset.relicPresetNames; delete tile.dataset.relicPresetLevel; }
    });
    count.textContent = `Markiert: ${marked}`;
  };
  function persist(): void {
    try { localStorage.setItem(STORAGE_KEY, writePresets(presets, installed, color, partialColor)); message.textContent = ''; }
    catch { message.textContent = 'Nur für diese Sitzung übernommen: Browser-Speicher ist nicht verfügbar.'; }
    renderList(); highlight();
  }
  function renderList(): void {
    list.replaceChildren();
    if (!presets.length) { const empty = document.createElement('p'); empty.className = 'preset-empty'; empty.textContent = 'Keine Presets.'; list.append(empty); }
    const groups: Array<[string, RelicPreset[]]> = [
      ['Kampf', presets.filter(p => p.id.startsWith('default:') && !p.allBonuses)],
      ['Rohstoffe', presets.filter(p => p.id.startsWith('default:') && p.allBonuses)],
      ['Eigene', presets.filter(p => !p.id.startsWith('default:'))]
    ];
    groups.forEach(([group, rules]) => {
      if (!rules.length) return;
      const groupTitle = document.createElement('strong'); groupTitle.className = 'preset-group'; groupTitle.textContent = group; list.append(groupTitle);
      rules.forEach(preset => {
      const card = document.createElement('section'); card.className = 'preset-card'; card.dataset.presetId = preset.id;
      card.title = preset.name;
      const enabled = document.createElement('input'); enabled.type = 'checkbox'; enabled.checked = preset.enabled;
      enabled.setAttribute('aria-label', `${preset.name}: aktiv`);
      enabled.addEventListener('change', () => {
        preset.enabled = enabled.checked; persist();
        Array.from(list.querySelectorAll<HTMLElement>('.preset-card')).find(c => c.dataset.presetId === preset.id)?.querySelector<HTMLInputElement>('input')?.focus();
      });
      const selection = checkboxLabel(preset.name, enabled); selection.querySelector('span')!.className = 'preset-name';
      card.append(selection);
      const summary = document.createElement('div'); summary.className = 'preset-summary';
      const typeName = preset.type ? types.find(t => t.value === preset.type)?.label || `Nicht verfügbar: ${preset.type}` : 'Beliebiger Typ';
      if (preset.allBonuses) { summary.textContent = preset.name; summary.title = `2/3 oder 3/3: ${preset.substats.map(statLabel).join(' / ')}`; }
      else {
        summary.append(bonusBadge(typeName, true, true), document.createTextNode('›'));
        preset.substats.forEach(id => summary.append(bonusBadge(statLabel(id), false, true)));
      }
      if (preset.shinyOnly) { const mark = document.createElement('span'); mark.textContent = '✦'; mark.style.color = '#d32697'; mark.title = 'Nur Shiny'; summary.append(mark); }
      selection.append(summary);
      const edit = button('✎', () => {
        resetEditor(); editingId = preset.id; heading.textContent = 'Preset bearbeiten'; name.value = preset.name;
        if (preset.type && !types.some(t => t.value === preset.type)) {
          addOption(preset.type, `Nicht verfügbar: ${preset.type}`); type.lastElementChild!.setAttribute('data-unavailable', '');
        }
        type.value = preset.type; selectedStats = new Set(preset.substats); mode.value = preset.allBonuses ? 'all' : 'exact';
        type.disabled = !!preset.allBonuses; shiny.checked = !!preset.shinyOnly;
        renderStatChoices(); message.textContent = ''; showEditor();
      });
      edit.className = 'preset-edit'; edit.setAttribute('aria-label', `${preset.name} bearbeiten`); edit.title = 'Bearbeiten';
      card.append(edit); list.append(card);
      });
    });
    const enabled = presets.filter(p => p.enabled).length;
    const title = enabled ? `Presets (${enabled})` : 'Presets'; trigger.textContent = title; dock.setTitle(title);
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!name.value.trim()) { editorMessage.textContent = 'Bitte gib dem Preset einen Namen.'; name.focus(); return; }
    if (!type.value && !selectedStats.size) { editorMessage.textContent = 'Wähle mindestens einen Typ oder einen Substat.'; return; }
    if ((type.value && !types.some(t => t.value === type.value)) || Array.from(selectedStats).some(id => !stats.some(s => s.value === id))) {
      editorMessage.textContent = 'Ein Typ oder Substat ist nicht mehr verfügbar. Bitte passe die Auswahl an.'; return;
    }
    const previous = presets.find(p => p.id === editingId);
    const preset: RelicPreset = { id: editingId || crypto.randomUUID(), name: name.value.trim(), enabled: previous?.enabled ?? true, type: type.value, substats: Array.from(selectedStats),
      ...(mode.value === 'all' ? { allBonuses: true } : {}), ...(shiny.checked ? { shinyOnly: true } : {}) };
    if (previous) presets = presets.map(p => p.id === editingId ? preset : p);
    else presets.push(preset);
    resetEditor(); persist(); newButton.focus();
  });
  new MutationObserver(highlight).observe(grid, { childList: true, subtree: true });
  resetEditor(); renderList(); highlight();
}
