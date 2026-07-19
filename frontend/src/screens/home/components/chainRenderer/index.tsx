import { useCurrentChain } from "@/api/chain";
import ChainCard from "@/ui/components/cards/ChainCard";
import { CARD_SIZES } from "@/ui/components/cards/size";
import { CardTypes } from "@/ui/components/cards/types";
import { useResponsiveValue } from "@/ui/theme/utils";
import { useLatestRef } from "@/utils/ref";
import { useCallback, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import Sortable, { SortableGridRenderItem } from "react-native-sortables";
import { StyleSheet } from "react-native-unistyles";
import { GHOST_NODE_PREFIX, GRID_COLUMNS } from "../consts";
import AddPluginButton from "./AddPluginButton";
import ChainPath from "./chainPath";
import DragArea from "./DragArea";
import { GridItem } from "./types";
import { useChainDragStartegy } from "./useChainDragStartegy";
import useHandleGestures from "./useHandleGestures";
import { snakifyArray } from "./utils";

const PADDING_SIZE = 24;
const GRID_GAP = 12;

type ChainRendererProps = {
  onChainItemPress: (pluginId: string) => void;
  onAddPluginPress: () => void;
};

const ChainRenderer = ({
  onChainItemPress,
  onAddPluginPress,
}: ChainRendererProps) => {
  const onChainItemPressRef = useLatestRef(onChainItemPress);
  const {
    showDragArea,
    dragAreaHeight,
    dragsOverZone,
    isDeletePending,
    isReorderPending,
    onDragStart,
    onContainerLayout,
    onDragMove,
    onDragEnd,
  } = useHandleGestures();

  const { width } = useWindowDimensions();
  const scrollableRef = useAnimatedRef<Animated.ScrollView>();
  const cardHeight = useResponsiveValue(CARD_SIZES[CardTypes.chainCard].height);
  const { data: chain = [] } = useCurrentChain();

  const visualData = useMemo(() => {
    const padded: GridItem[] = [...chain];
    const remainder = padded.length % GRID_COLUMNS;

    if (remainder !== 0) {
      const missing = GRID_COLUMNS - remainder;
      for (let i = 0; i < missing; i++) {
        padded.push({
          id: `${GHOST_NODE_PREFIX}${i}`,
          metadata: {
            uri: GHOST_NODE_PREFIX,
          },
          isGhost: true,
        } as GridItem);
      }
    }

    return snakifyArray(padded, GRID_COLUMNS);
  }, [chain]);

  const renderItem = useCallback<SortableGridRenderItem<GridItem>>(
    ({ item }) => {
      return (
        <Sortable.Touchable>
          <Sortable.Handle mode={item.isGhost ? "fixed-order" : "draggable"}>
            {item.isGhost ? (
              <View style={{ flex: 1, opacity: 0 }} pointerEvents="none" />
            ) : (
              <ChainCard
                disabled={isReorderPending}
                name={item.metadata.name}
                effectClass={item.metadata.class}
                onPress={() => onChainItemPressRef.current(item.id)}
              />
            )}
          </Sortable.Handle>
        </Sortable.Touchable>
      );
    },
    [isReorderPending, onChainItemPressRef],
  );

  const startY = PADDING_SIZE + cardHeight / 2;
  const stepHeight = GRID_GAP + cardHeight;

  const sortEnabled = !isReorderPending && !isDeletePending;

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <ChainPath
        startY={startY}
        width={width}
        chainLength={chain?.length}
        numberOfColumns={GRID_COLUMNS}
        padding={10}
        stepHeight={stepHeight}
      />
      <Animated.ScrollView ref={scrollableRef} style={styles.gridContainer}>
        <Sortable.Grid
          sortEnabled={sortEnabled}
          data={visualData}
          columns={GRID_COLUMNS}
          rowGap={GRID_GAP}
          columnGap={GRID_GAP}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          customHandle
          strategy={useChainDragStartegy}
          scrollableRef={scrollableRef}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDragMove={onDragMove}
        />
      </Animated.ScrollView>
      {showDragArea && (
        <DragArea
          height={dragAreaHeight}
          active={dragsOverZone}
          isDeleting={isDeletePending}
        />
      )}
      <AddPluginButton
        onPress={onAddPluginPress}
        offsetY={showDragArea ? dragAreaHeight : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContainer: {
    paddingTop: PADDING_SIZE,
    paddingHorizontal: PADDING_SIZE,
  },
});

export default ChainRenderer;
