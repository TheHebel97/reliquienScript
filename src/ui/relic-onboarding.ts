const DIALOG_ID = 'relic-onboarding';
const STORAGE_KEY = 'reliquiensrtipz:onboarding-seen';

export function installRelicOnboarding(): void {
  const line = document.querySelector('#relic-search .search-line');
  if (!line || !document.getElementById('relics') || document.getElementById(DIALOG_ID)) return;
  const style = document.createElement('style');
  style.textContent = `
    #${DIALOG_ID} { position: fixed; width: min(560px, calc(100vw - 32px)); max-height: calc(100vh - 80px); box-sizing: border-box; overflow: auto; padding: 22px; border: 1px solid #a78c61; border-radius: 9px; background: #f1e3c3; color: #412b13; font: 12px/1.5 Verdana, sans-serif; box-shadow: 0 4px 24px #0004; }
    #${DIALOG_ID}::backdrop { background: #0006; }
    #${DIALOG_ID} h2 { margin: 0 28px 4px 0; font-size: 18px; }
    #${DIALOG_ID} .intro { margin: 0 0 14px; }
    #${DIALOG_ID} .tips { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 0; }
    #${DIALOG_ID} .tips > div { padding: 10px; background: #fff4d9; border: 1px solid #c8b58e; border-radius: 6px; }
    #${DIALOG_ID} .tips > .click-tip { border-top: 3px solid #76502d; }
    #${DIALOG_ID} dt { font-weight: bold; margin-bottom: 4px; }
    #${DIALOG_ID} dd { margin: 0; }
    #${DIALOG_ID} .footer-note { margin: 12px 0; font-size: 11px; }
    #${DIALOG_ID} .actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; }
    #${DIALOG_ID} button { cursor: pointer; font: inherit; padding: 5px 10px; border: 1px solid #b39a6b; border-radius: 6px; background: #f4e4c2; color: inherit; }
    #${DIALOG_ID} button.primary { background: #76502d; color: #fff4d9; border-color: #563716; }
    #${DIALOG_ID} .close { position: absolute; top: 10px; right: 10px; padding: 2px 8px; font-size: 18px; }
    #${DIALOG_ID} button:focus-visible { outline: 2px solid #915dac; outline-offset: 2px; }
    #relic-onboarding-help { flex-shrink: 0; }
    @media (max-width: 480px) { #${DIALOG_ID} { padding: 16px; } #${DIALOG_ID} .tips { grid-template-columns: minmax(0, 1fr); gap: 8px; } }
  `;
  document.head.append(style);
  const dialog = document.createElement('dialog'); dialog.id = DIALOG_ID;
  dialog.setAttribute('aria-labelledby', 'relic-onboarding-title');
  dialog.setAttribute('aria-describedby', 'relic-onboarding-intro');
  dialog.innerHTML = `
    <h2 id="relic-onboarding-title" tabindex="-1">Reliquien – kurz erklärt</h2>
    <p id="relic-onboarding-intro" class="intro">Die wichtigsten Handgriffe für dein Inventar.</p>
    <dl class="tips">
      <div class="click-tip"><dt>Linksklick → Aufwertung</dt><dd>Legt die Reliquie in den nächsten freien Aufwertungsslot. Die eigentliche Aufwertung startest du danach über den Aufwertungsbutton.</dd></div>
      <div class="click-tip"><dt>Rechtsklick → Ausrüsten</dt><dd>Wählt die Reliquie im Ausrüstfenster am Rand aus. Dort kannst du auf „Ausrüsten“ klicken und die Spielbestätigung prüfen.</dd></div>
      <div><dt>Hover-Vorschau</dt><dd>Fahre über eine Kachel, um ihre Stats zu sehen. Du kannst direkt weiter über andere Kacheln fahren; die Vorschau ist für die Maus durchlässig.</dd></div>
      <div><dt>Suche</dt><dd>Durchsuche Namen, Typen und Boni, zum Beispiel mit „shiny kata def“. Die Treffer passen sich sofort an.</dd></div>
      <div><dt>Filter & Sortierung</dt><dd>Grenze nach Qualität, Typ, Substats oder Shiny ein und ändere die Reihenfolge. „Zurücksetzen“ leert Suche und Filter und stellt die Standardsortierung her.</dd></div>
      <div><dt>Presets</dt><dd>Aktiviere deine Wunschkombinationen: Der gewählte Hauptbonus muss passen. Hauptbonus plus ein gewünschter Substat ergibt 2/3, plus beide Substats einen Volltreffer. Beide bekommen kräftige, durchgehende Rahmen in einstellbaren Farben. Bei Rohstoffregeln muss der Hauptbonus aus der Auswahl stammen. Der Stift öffnet den Editor. Shiny erkennst du an der Regenbogen-Schattierung auf dem Gegenstand, auch zusammen mit einem Preset-Rahmen.</dd></div>
    </dl>
    <p class="footer-note">Die Randfenster kannst du an den Kopfzeilen verschieben. Diese Hilfe findest du später über „?“ neben der Suche.</p>
  `;
  document.body.append(dialog);
  const help = document.createElement('button'); help.type = 'button'; help.id = 'relic-onboarding-help'; help.textContent = '?';
  help.title = 'Bedienung des Scripts'; help.setAttribute('aria-label', 'Script-Hilfe öffnen'); help.setAttribute('aria-controls', DIALOG_ID);
  line.append(help);
  let previousFocus: HTMLElement | null = null;
  const open = (): void => {
    if (dialog.open) return;
    previousFocus = document.activeElement as HTMLElement;
    dialog.showModal(); dialog.querySelector<HTMLElement>('h2')!.focus();
  };
  const dismiss = (): void => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* Dismiss remains available without storage. */ }
    dialog.close();
    const target = previousFocus && previousFocus !== document.body && previousFocus.isConnected
      ? previousFocus : document.getElementById('relic-search-input') || help;
    target.focus();
  };
  const button = (text: string, className: string): HTMLButtonElement => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.className = className; b.addEventListener('click', dismiss); return b;
  };
  const close = button('×', 'close'); close.setAttribute('aria-label', 'Einführung schließen');
  const actions = document.createElement('div'); actions.className = 'actions';
  actions.append(button('Verstanden', 'primary')); dialog.prepend(close); dialog.append(actions);
  dialog.addEventListener('cancel', event => { event.preventDefault(); dismiss(); });
  help.addEventListener('click', open);
  let seen = false;
  try { seen = localStorage.getItem(STORAGE_KEY) === '1'; } catch { /* Still show the introduction if storage is unavailable. */ }
  if (!seen) open();
}
