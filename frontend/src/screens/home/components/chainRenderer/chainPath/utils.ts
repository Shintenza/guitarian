export type ChainPathConfig = {
  width: number;
  padding: number;
  cornerRadius: number;
  stepHeight: number;
  startY: number;
  chainLength: number;
  numberOfColumns: number;
  elementMargin?: number;
};

const DEFAULT_ELEMENT_MARGIN = 20;

export const computeChainPath = ({
  width,
  padding,
  cornerRadius,
  stepHeight,
  chainLength,
  numberOfColumns,
  startY,
  elementMargin = DEFAULT_ELEMENT_MARGIN,
}: ChainPathConfig) => {
  if (chainLength === 0) {
    return { pathData: "", totalLength: 0 };
  }

  const pathWidth = width - padding * 2;
  const colWidth = pathWidth / numberOfColumns;

  const arcLength = (Math.PI * cornerRadius) / 2;
  const verticalLength = stepHeight - 2 * cornerRadius;
  const horizontalLength = pathWidth - 2 * cornerRadius;

  const currentRow = Math.floor((chainLength - 1) / numberOfColumns);
  const itemsInCurrentRow = chainLength - currentRow * numberOfColumns;

  let d = `M 0 ${startY}`;
  let currentY = startY;
  let length = 0;

  for (let r = 0; r <= currentRow; r++) {
    const isRightEdge = r % 2 === 0;
    let targetX = 0;

    if (r === 0) {
      targetX = width - padding - cornerRadius;
      d += ` L ${targetX} ${currentY}`;
      length += targetX;
    } else {
      if (r === currentRow) {
        if (isRightEdge) {
          targetX = padding + itemsInCurrentRow * colWidth + elementMargin;
          if (targetX > width - padding - cornerRadius) {
            targetX = width - padding - cornerRadius;
          }
          length += targetX - (padding + cornerRadius);
        } else {
          targetX =
            width - padding - itemsInCurrentRow * colWidth - elementMargin;
          if (targetX < padding + cornerRadius) {
            targetX = padding + cornerRadius;
          }
          length += width - padding - cornerRadius - targetX;
        }
      } else {
        targetX = isRightEdge
          ? width - padding - cornerRadius
          : padding + cornerRadius;
        length += horizontalLength;
      }

      d += ` L ${targetX} ${currentY}`;
    }

    const sweepFlag = isRightEdge ? 1 : 0;
    const sideX = isRightEdge ? width - padding : padding;
    const turnInX = isRightEdge
      ? width - padding - cornerRadius
      : padding + cornerRadius;

    if (r < currentRow) {
      d += ` A ${cornerRadius} ${cornerRadius} 0 0 ${sweepFlag} ${sideX} ${currentY + cornerRadius}`;
      currentY += cornerRadius;

      d += ` L ${sideX} ${currentY + verticalLength}`;
      currentY += verticalLength;

      d += ` A ${cornerRadius} ${cornerRadius} 0 0 ${sweepFlag} ${turnInX} ${currentY + cornerRadius}`;
      currentY += cornerRadius;

      length += 2 * arcLength + verticalLength;
    } else if (r === currentRow && itemsInCurrentRow === numberOfColumns) {
      d += ` A ${cornerRadius} ${cornerRadius} 0 0 ${sweepFlag} ${sideX} ${currentY + cornerRadius}`;
      currentY += cornerRadius;

      const halfVerticalLength = stepHeight / 2 - cornerRadius;
      d += ` L ${sideX} ${currentY + halfVerticalLength}`;
      currentY += halfVerticalLength;

      length += arcLength + halfVerticalLength;
    }
  }

  return { pathData: d, totalLength: length };
};
