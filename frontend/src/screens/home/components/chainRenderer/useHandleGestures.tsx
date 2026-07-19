import {
  useChainReorder,
  useCurrentChain,
  useRemoveChainItem,
} from "@/api/chain";
import { useRef, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import {
  DragEndCallback,
  DragMoveCallback,
  DragStartCallback,
} from "react-native-sortables";
import { toast } from "sonner-native";
import { DRAG_AREA_HEIGHT, GRID_COLUMNS } from "../consts";
import { toLogical } from "./utils";

const useHandleGestures = () => {
  const { data: chain = [] } = useCurrentChain();
  const [isDragging, setIsDragging] = useState(false);
  const { mutate: removeItem, isPending: isRemovePending } =
    useRemoveChainItem();

  const { mutate: reorderChain, isPending: isReorderPending } =
    useChainReorder();

  const [dragsOverZone, setDragsOverZone] = useState(false);
  const topBoundaryRef = useRef(0);
  const bottomBoundaryRef = useRef(0);
  const isInZoneRef = useRef(false);

  const onContainerLayout = (e: LayoutChangeEvent) => {
    const { y, height } = e.nativeEvent.layout;
    const top = y + height - DRAG_AREA_HEIGHT;
    topBoundaryRef.current = top;
    bottomBoundaryRef.current = top + DRAG_AREA_HEIGHT;
  };

  const onDragStart: DragStartCallback = () => {
    setIsDragging(true);
  };

  const onDragMove: DragMoveCallback = (e) => {
    const yLocation = e.touchData.absoluteY;
    const isInZone =
      yLocation >= topBoundaryRef.current &&
      yLocation <= bottomBoundaryRef.current;

    if (isInZone && !isInZoneRef.current) {
      setDragsOverZone(true);
      isInZoneRef.current = true;
    }

    if (isInZoneRef.current && !isInZone) {
      isInZoneRef.current = false;
      setDragsOverZone(false);
    }
  };

  const onDragEnd: DragEndCallback = async (e) => {
    const fromIndexLogical = toLogical(e.fromIndex, GRID_COLUMNS);
    const toIndexLogical = toLogical(e.toIndex, GRID_COLUMNS);
    setIsDragging(false);

    if (isInZoneRef.current) {
      const item = chain.at(fromIndexLogical);
      if (!isInZoneRef.current) return;

      if (!item) return;
      removeItem(
        { pluginId: item.id },
        {
          onError: () => {
            toast.error("Failed to reorder chain");
          },
        },
      );
    } else {
      if (fromIndexLogical === toIndexLogical) return;
      reorderChain(
        {
          indexFrom: fromIndexLogical,
          indexTo: toIndexLogical,
        },
        {
          onError: () => {
            toast.error("Failed to reorder chain");
          },
        },
      );
    }
  };

  return {
    showDragArea: isDragging || isRemovePending,
    isDeletePending: isRemovePending,
    isReorderPending: isReorderPending,
    dragsOverZone,
    dragAreaHeight: DRAG_AREA_HEIGHT,
    onContainerLayout,
    onDragStart,
    onDragMove,
    onDragEnd,
  };
};

export default useHandleGestures;
