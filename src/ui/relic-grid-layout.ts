export function relicGridCapacity(width: number, availableHeight: number): { columns: number; rows: number; pageSize: number } {
  if (!Number.isFinite(width) || !Number.isFinite(availableHeight)) return { columns: 1, rows: 1, pageSize: 1 };
  const gap = 2;
  const columns = Math.max(1, Math.min(10, Math.floor((width + gap) / (55.25 + gap))));
  const tileSize = Math.max(1, (width - gap * (columns - 1)) / columns);
  const rows = Math.max(1, Math.min(8, Math.floor((availableHeight + gap) / (tileSize + gap))));
  return { columns, rows, pageSize: columns * rows };
}
