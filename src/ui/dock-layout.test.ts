import { arrangeDock, balanceDockSides, dockHeightLimits, DOCK_GAP, DOCK_MARGIN } from './dock-layout';

test('moves another panel when the requested edge lacks room for a tall incoming panel', () => {
  const items = [150, 200, 250, 340].map(height => ({ side: 'right' as const, height }));
  expect(balanceDockSides(items, 800, 3)).toEqual(['right', 'left', 'right', 'right']);
});

test('uses actual height, allowing all four panels when a larger viewport has room', () => {
  const items = [150, 200, 250, 340].map(height => ({ side: 'right' as const, height }));
  expect(balanceDockSides(items, 1100, 3)).toEqual(['right', 'right', 'right', 'right']);
});

test('can swap panels between two occupied edges while honoring the dragged panel', () => {
  const items = [
    { side: 'right' as const, height: 350 }, { side: 'right' as const, height: 300 },
    { side: 'left' as const, height: 180 }, { side: 'left' as const, height: 280 }
  ];
  expect(balanceDockSides(items, 600, 0)).toEqual(['right', 'left', 'right', 'left']);
});

test('counts panel gaps and does not assume that three panels always fit', () => {
  const items = [150, 150, 150].map(height => ({ side: 'right' as const, height }));
  expect(balanceDockSides(items, 450, 0).filter(side => side === 'right')).toHaveLength(2);
});

test('minimizes unavoidable overflow without oscillating when a panel exceeds the viewport', () => {
  const items = [{ side: 'right' as const, height: 1000 }, { side: 'right' as const, height: 100 }];
  const sides = balanceDockSides(items, 600, 0);
  expect(sides).toEqual(['right', 'left']);
  expect(balanceDockSides(items.map((item, i) => ({ ...item, side: sides[i] })), 600, 0)).toEqual(sides);
});

test('keeps natural heights when all panels fit instead of capping a large editor equally', () => {
  expect(dockHeightLimits([100, 120, 180, 360], 800)).toEqual([100, 120, 180, 360]);
});

test('gives tall panels the space unused by short panels, preserving input order', () => {
  expect(dockHeightLimits([500, 100, 400], 700)).toEqual([300, 100, 300]);
  expect(dockHeightLimits([100, 200], -10)).toEqual([0, 0]);
});

test.each([
  [{ top: 100, height: 340 }, { top: 100, height: 120 }],
  [{ top: 780, height: 340 }, { top: 790, height: 120 }],
  [{ top: -100, height: 340 }, { top: 20, height: 120 }],
  [{ top: 500, height: 340 }, { top: 50, height: 120 }],
])('keeps colliding panels inside the viewport with a gap: %j', (...items) => {
  const tops = arrangeDock(items, 850);
  const rects = items.map((item, i) => ({ top: tops[i], bottom: tops[i] + item.height }))
    .sort((a, b) => a.top - b.top);
  expect(rects[0].top).toBeGreaterThanOrEqual(DOCK_MARGIN);
  expect(rects[1].top - rects[0].bottom).toBeGreaterThanOrEqual(DOCK_GAP);
  expect(rects[1].bottom).toBeLessThanOrEqual(850 - DOCK_MARGIN);
});

test('preserves separated positions and input order', () => {
  expect(arrangeDock([{ top: 500, height: 100 }, { top: 96, height: 340 }], 850)).toEqual([500, 96]);
});

test('keeps panels below a fixed header', () => {
  expect(arrangeDock([{ top: 0, height: 100 }], 850, 57)).toEqual([57]);
});

test('fits three overlapping tool windows below the header', () => {
  const items = [260, 206, 201].map(height => ({ top: 600, height }));
  const tops = arrangeDock(items, 855, 57);
  expect(tops[0]).toBeGreaterThanOrEqual(57);
  expect(tops[1]).toBeGreaterThanOrEqual(tops[0] + 260 + DOCK_GAP);
  expect(tops[2]).toBeGreaterThanOrEqual(tops[1] + 206 + DOCK_GAP);
  expect(tops[2] + 201).toBeLessThanOrEqual(855);
});
