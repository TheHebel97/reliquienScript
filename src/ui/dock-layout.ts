export const DOCK_MARGIN = 0;
export const DOCK_GAP = 8;

type DockSide = 'left' | 'right';

// Keep the incoming/dragged panel at its chosen edge and move as few other panels
// as possible. The small number of registered windows keeps this search bounded.
export function balanceDockSides(
  items: { side: DockSide; height: number }[],
  availableHeight: number,
  preferredIndex = -1
): DockSide[] {
  const capacity = Math.max(0, availableHeight);
  const score = (sides: DockSide[]): number[] => {
    const height = (side: DockSide): number => {
      const group = items.filter((_, i) => sides[i] === side);
      return group.reduce((sum, item) => sum + item.height, 0) + Math.max(0, group.length - 1) * DOCK_GAP;
    };
    let moves = 0; let movedHeight = 0;
    sides.forEach((side, i) => { if (side !== items[i].side) { moves++; movedHeight += items[i].height; } });
    return [Math.max(0, height('left') - capacity) + Math.max(0, height('right') - capacity), moves, movedHeight];
  };
  let best = items.map(item => item.side);
  let bestScore = score(best);
  if (!bestScore[0]) return best;
  const candidate: DockSide[] = [];
  const search = (index: number): void => {
    if (index === items.length) {
      const candidateScore = score(candidate);
      const firstDifference = candidateScore.findIndex((value, i) => value !== bestScore[i]);
      if (firstDifference >= 0 && candidateScore[firstDifference] < bestScore[firstDifference]) {
        best = candidate.slice(); bestScore = candidateScore;
      }
      return;
    }
    candidate[index] = items[index].side; search(index + 1);
    if (index !== preferredIndex) {
      candidate[index] = items[index].side === 'left' ? 'right' : 'left'; search(index + 1);
    }
  };
  search(0);
  return best;
}

// Small panels keep their natural height; larger panels share only the remaining space.
export function dockHeightLimits(heights: number[], availableHeight: number): number[] {
  const ordered = heights.map((height, index) => ({ height: Math.max(0, height), index })).sort((a, b) => a.height - b.height);
  const limits: number[] = [];
  let remaining = Math.max(0, availableHeight);
  ordered.forEach((item, i) => {
    const limit = Math.min(item.height, remaining / (ordered.length - i));
    limits[item.index] = limit;
    remaining -= limit;
  });
  return limits;
}

// Heights must fit below the fixed game header; the controller caps them before layout.
export function arrangeDock(
  items: { top: number; height: number }[],
  viewportHeight: number,
  topInset = 0,
  bottomInset = 0
): number[] {
  const ordered = items.map((item, index) => ({ ...item, index }))
    .sort((a, b) => a.top - b.top || a.index - b.index);
  const tops: number[] = [];
  ordered.forEach((item, i) => {
    tops[i] = Math.max(topInset, item.top,
      i ? tops[i - 1] + ordered[i - 1].height + DOCK_GAP : topInset);
  });
  for (let i = ordered.length - 1; i >= 0; i--) {
    const bottom = i === ordered.length - 1 ? viewportHeight - bottomInset : tops[i + 1] - DOCK_GAP;
    tops[i] = Math.min(tops[i], bottom - ordered[i].height);
  }
  const result: number[] = [];
  ordered.forEach((item, i) => { result[item.index] = tops[i]; });
  return result;
}
