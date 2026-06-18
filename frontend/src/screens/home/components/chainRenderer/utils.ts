import { DragEndParams } from "react-native-sortables/dist/typescript/types";

export const GHOST_NODE_PREFIX = "ghost_";

export const toLogical = (vIndex: number, columns: number) => {
  "worklet";
  const row = Math.floor(vIndex / columns);
  const col = vIndex % columns;
  return row % 2 !== 0 ? row * columns + (columns - 1 - col) : vIndex;
};

export const toVisual = (lIndex: number, columns: number) => {
  "worklet";
  const row = Math.floor(lIndex / columns);
  const col = lIndex % columns;
  return row % 2 !== 0 ? row * columns + (columns - 1 - col) : lIndex;
};

export const snakifyArray = <T>(array: T[], columns: number) => {
  const result: T[] = [];
  for (let i = 0; i < array.length; i += columns) {
    const chunk = array.slice(i, i + columns);
    const rowIndex = Math.floor(i / columns);

    if (rowIndex % 2 !== 0) {
      chunk.reverse();
    }
    result.push(...chunk);
  }
  return result;
};

export const computeChanges = (data: DragEndParams) => {};
