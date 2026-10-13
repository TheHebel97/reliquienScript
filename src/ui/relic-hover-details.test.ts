/** @jest-environment jsdom */
import { installRelicHoverDetails } from './relic-hover-details';

jest.mock('./docked-panels', () => ({ addDockedPanel: (element: HTMLElement) => ({
  setVisible: (visible: boolean) => { element.hidden = !visible; }, setTitle: () => {}
}) }));

let equipped: string[];
let slotted: string[];
const tile = (id = '1'): HTMLElement => document.querySelector<HTMLElement>(`#relics > div[data-test-id="${id}"]`)!;
const tooltip = (): HTMLElement => document.getElementById('relic-hover-details')!;
const panel = (): HTMLElement => document.getElementById('relic-equip-window')!;
const equip = (): HTMLButtonElement => document.getElementById('relic-equip-button') as HTMLButtonElement;
const pointer = (element: Element, type: string, relatedTarget: EventTarget | null = null): void => {
  element.dispatchEvent(new MouseEvent(type, { bubbles: true, relatedTarget }));
};
const rightClick = (element: HTMLElement): MouseEvent => {
  const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 });
  element.dispatchEvent(event); return event;
};
const flush = async (): Promise<void> => { await Promise.resolve(); };

beforeEach(() => {
  document.head.replaceChildren();
  document.body.innerHTML = `<div id="relics">
    <div data-test-id="1"><img data-id="1"></div>
    <div data-test-id="2"><img data-id="2"></div>
    <div data-test-id="empty"><img></div>
  </div><div id="selected_relic_details"></div><button id="outside">Andere Aktion</button>`;
  equipped = []; slotted = [];
  document.querySelectorAll<HTMLImageElement>('#relics img[data-id]').forEach(image => {
    image.addEventListener('click', () => {
      document.querySelector('.relic-selected')?.classList.remove('relic-selected');
      image.parentElement!.classList.add('relic-selected');
      document.getElementById('selected_relic_details')!.innerHTML = `<div class="relic-details">
        <div class="header">Reliquie ${image.dataset.id}</div>
        <div class="body"><span class="sub_stat">Bonus</span></div>
        <div class="buttons"><button id="equip_button" class="btn">Ausrüsten</button>
        <button id="add_relic_to_upgrade_panel_button" class="btn">Aufwerten</button></div></div>`;
      document.getElementById('equip_button')!.addEventListener('click', () => {
        equipped.push(image.dataset.id!); document.getElementById('selected_relic_details')!.replaceChildren(); image.parentElement!.remove();
      });
      document.getElementById('add_relic_to_upgrade_panel_button')!.addEventListener('click', () => {
        slotted.push(image.dataset.id!); document.getElementById('selected_relic_details')!.replaceChildren(); image.parentElement!.remove();
      });
    });
  });
  installRelicHoverDetails();
});

test('hover preview is mouse-transparent and has no actions; moving across tiles updates it', () => {
  pointer(tile(), 'pointerover');
  expect(tooltip().hidden).toBe(false);
  expect(getComputedStyle(tooltip()).pointerEvents).toBe('none');
  expect(tooltip().querySelector('button')).toBeNull();
  pointer(tile(), 'pointerout', tile('2')); pointer(tile('2'), 'pointerover', tile());
  expect(tooltip().textContent).toContain('Reliquie 2'); expect(panel().hidden).toBe(true);
});

test('leaving a tile for the stats window closes immediately instead of retaining hover', () => {
  pointer(tile(), 'pointerover'); pointer(tile(), 'pointerout', tooltip()); expect(tooltip().hidden).toBe(true);
});

test('right click pins details; later hover does not change which relic the native equip button equips', async () => {
  expect(rightClick(tile('2')).defaultPrevented).toBe(true);
  expect(panel().hidden).toBe(false); expect(panel().textContent).toContain('Reliquie 2');
  expect(slotted).toEqual([]); expect(equipped).toEqual([]);
  pointer(tile(), 'pointerover'); await flush();
  expect(tooltip().textContent).toContain('Reliquie 1'); expect(panel().textContent).toContain('Reliquie 2');
  equip().click(); expect(equipped).toEqual(['2']); expect(slotted).toEqual([]);
  expect(panel().hidden).toBe(true); expect(tooltip().hidden).toBe(true);
});

test('right clicking a different relic replaces the pinned selection; placeholder keeps its browser menu', () => {
  rightClick(tile()); rightClick(tile('2')); equip().click(); expect(equipped).toEqual(['2']);
  expect(rightClick(tile('empty')).defaultPrevented).toBe(false);
});

test('left click still fills the next native upgrade slot and invalidates the pinned relic', async () => {
  rightClick(tile()); tile().click(); await flush();
  expect(slotted).toEqual(['1']); expect(equipped).toEqual([]);
  expect(tooltip().hidden).toBe(true); expect(panel().hidden).toBe(true);
});

test('hover closes on blur and paging, while a removed pinned relic cannot be equipped', async () => {
  pointer(tile(), 'pointerover'); window.dispatchEvent(new Event('blur')); await flush(); expect(tooltip().hidden).toBe(true);
  rightClick(tile()); document.getElementById('relics')!.replaceChildren(); equip().click(); await flush();
  expect(equipped).toEqual([]); expect(panel().hidden).toBe(true);
});

test('reflects native eligibility and rechecks it when restoring the pinned selection', async () => {
  rightClick(tile()); (document.getElementById('equip_button') as HTMLButtonElement).disabled = true;
  await flush(); expect(equip().disabled).toBe(true); equip().click(); expect(equipped).toEqual([]);
});

test('native updates preserve button focus and do not replace the pin with hover details', async () => {
  rightClick(tile()); const button = equip(); button.focus(); await flush(); expect(document.activeElement).toBe(button);
  pointer(tile('2'), 'pointerover'); await flush(); expect(panel().textContent).toContain('Reliquie 1'); expect(document.activeElement).toBe(button);
});

test('closing the equip panel clears its selection', () => {
  rightClick(tile()); document.querySelector<HTMLButtonElement>('#relic-equip-window .relic-dock-close')!.click();
  equip().click(); expect(equipped).toEqual([]); expect(panel().hidden).toBe(true);
});
