import { relicGridCapacity } from './relic-grid-layout';

test('uses full width with at most ten columns and eight rows', () => {
  expect(relicGridCapacity(800, 1000)).toEqual({ columns: 10, rows: 8, pageSize: 80 });
});

test('reduces the number of rows when viewport height is limited', () => {
  expect(relicGridCapacity(800, 400)).toEqual({ columns: 10, rows: 5, pageSize: 50 });
});

test('uses fewer columns on narrow containers', () => {
  expect(relicGridCapacity(460, 460)).toEqual({ columns: 8, rows: 8, pageSize: 64 });
});

test('keeps a usable page in very small viewports', () => {
  expect(relicGridCapacity(40, -100)).toEqual({ columns: 1, rows: 1, pageSize: 1 });
});
