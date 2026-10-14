import { installRelicGridLayout } from './ui/relic-grid';
import { installDockedPanels } from './ui/docked-panels';
import { installUpgradePreview } from './ui/upgrade-preview';
import { installRelicHoverDetails } from './ui/relic-hover-details';
import { installDiscoveredByToggle } from './ui/discovered-by-toggle';
import { installRelicShinyHighlight } from './ui/relic-shiny-highlight';
import { installRelicSearch } from './ui/relic-search';
import { installRelicPresets } from './ui/relic-presets';
import { installRelicOnboarding } from './ui/relic-onboarding';

function main(): void {
  var api = typeof unsafeWindow != 'undefined' ? unsafeWindow.ScriptAPI : window.ScriptAPI;
  api.register('reliquienUI', true, 'TheHebel97', 'support-nur-im-forum@die-staemme.de');
  installRelicGridLayout();
  installDockedPanels();
  installUpgradePreview();
  installRelicHoverDetails();
  installDiscoveredByToggle();
  installRelicShinyHighlight();
  installRelicSearch();
  installRelicPresets();
  installRelicOnboarding();
  console.info('[reliquiensrtipz] Userscript geladen.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main, { once: true });
} else {
  main();
}

export {};
