import {
  SortStrategyFactory,
  useCommonValuesContext,
  useGridLayoutContext,
} from "react-native-sortables";
import { GHOST_NODE_PREFIX } from "../consts";
import { toLogical, toVisual } from "./utils";

function snakeInsert(
  array: string[],
  from: number,
  to: number,
  columns: number,
) {
  "worklet";
  const logicalArray = new Array(array.length);
  for (let i = 0; i < array.length; i++) {
    logicalArray[toLogical(i, columns)] = array[i];
  }

  const logicalFrom = toLogical(from, columns);
  const logicalTo = toLogical(to, columns);

  const item = logicalArray[logicalFrom];
  logicalArray.splice(logicalFrom, 1);
  logicalArray.splice(logicalTo, 0, item);

  const realItems: string[] = [];
  const ghostItems: string[] = [];

  for (let i = 0; i < logicalArray.length; i++) {
    if (logicalArray[i].includes(GHOST_NODE_PREFIX)) {
      ghostItems.push(logicalArray[i]);
    } else {
      realItems.push(logicalArray[i]);
    }
  }

  const fixedLogicalArray = realItems.concat(ghostItems);

  const newVisualArray = new Array(fixedLogicalArray.length);
  for (let i = 0; i < fixedLogicalArray.length; i++) {
    newVisualArray[toVisual(i, columns)] = fixedLogicalArray[i];
  }

  return newVisualArray;
}

export const useChainDragStartegy: SortStrategyFactory = () => {
  const { indexToKey } = useCommonValuesContext();
  const {
    mainGap: columnGap,
    crossGap: rowGap,
    numGroups: columns,
  } = useGridLayoutContext();

  return ({ activeIndex, position, dimensions }) => {
    "worklet";
    const centerX = position.x + dimensions.width / 2;
    const centerY = position.y + dimensions.height / 2;

    const col = Math.floor(centerX / (dimensions.width + rowGap.value));
    const row = Math.floor(centerY / (dimensions.height + columnGap.value));

    const targetIndex = row * (columns ?? 0) + col;
    const currentOrder = indexToKey.value;

    if (
      targetIndex >= 0 &&
      targetIndex < currentOrder.length &&
      targetIndex !== activeIndex
    ) {
      return snakeInsert(currentOrder, activeIndex, targetIndex, columns);
    }

    return undefined;
  };
};
