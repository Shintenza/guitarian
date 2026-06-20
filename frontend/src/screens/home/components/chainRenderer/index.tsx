import { useChainStore } from "@/stores/chain";
import ChainCard from "@/ui/components/cards/ChainCard";
import { CARD_SIZES } from "@/ui/components/cards/size";
import { CardTypes } from "@/ui/components/cards/types";
import { useResponsiveValue } from "@/ui/theme/utils";
import { useCallback, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import Sortable, {
  ActiveItemDroppedCallback,
  SortableGridRenderItem,
} from "react-native-sortables";
import { StyleSheet } from "react-native-unistyles";
import ChainPath from "./chainPath";
import { GridItem } from "./types";
import { useChainDragStartegy } from "./useChainDragStartegy";
import { GHOST_NODE_PREFIX, snakifyArray, toLogical } from "./utils";

const COLUMNS = 3;
const PADDING_SIZE = 24;
const GRID_GAP = 12;

const ChainRenderer = () => {
  const { width } = useWindowDimensions();
  const scrollableRef = useAnimatedRef<Animated.ScrollView>();
  const cardHeight = useResponsiveValue(CARD_SIZES[CardTypes.chainCard].height);
  const { chain, moveNode } = useChainStore();

  const visualData = useMemo(() => {
    const padded: GridItem[] = [...chain];
    const remainder = padded.length % COLUMNS;

    if (remainder !== 0) {
      const missing = COLUMNS - remainder;
      for (let i = 0; i < missing; i++) {
        padded.push({
          id: `${GHOST_NODE_PREFIX}${i}`,
          uri: GHOST_NODE_PREFIX,
          isGhost: true,
        } as GridItem);
      }
    }

    return snakifyArray(padded, COLUMNS);
  }, [chain]);

  const handleOrderChange: ActiveItemDroppedCallback = useCallback(
    (data) => {
      const fromIndexLogical = toLogical(data.fromIndex, COLUMNS);
      const toIndexLogical = toLogical(data.toIndex, COLUMNS);
      moveNode(fromIndexLogical, toIndexLogical);
    },
    [moveNode],
  );

  const renderItem = useCallback<SortableGridRenderItem<GridItem>>(
    ({ item }) => {
      return (
        <Sortable.Touchable
          onLongPress={() => {
            console.log(" THIS IS A LONG PRESS!");
          }}
        >
          <Sortable.Handle mode={item.isGhost ? "fixed-order" : "draggable"}>
            {item.isGhost ? (
              <View style={{ flex: 1, opacity: 0 }} pointerEvents="none" />
            ) : (
              <ChainCard
                name={item.name}
                effectClass={item.class}
                key={item.uri}
              />
            )}
          </Sortable.Handle>
        </Sortable.Touchable>
      );
    },
    [],
  );

  const startY = PADDING_SIZE + cardHeight / 2;
  const stepHeight = GRID_GAP + cardHeight;

  return (
    <View style={styles.container}>
      <ChainPath
        startY={startY}
        width={width}
        chainLength={chain.length}
        numberOfColumns={COLUMNS}
        padding={10}
        stepHeight={stepHeight}
      />
      <Animated.ScrollView ref={scrollableRef} style={styles.gridContainer}>
        <Sortable.Grid
          data={visualData}
          columns={COLUMNS}
          rowGap={GRID_GAP}
          columnGap={GRID_GAP}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          customHandle
          strategy={useChainDragStartegy}
          onActiveItemDropped={handleOrderChange}
          scrollableRef={scrollableRef}
        />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
  },
  gridContainer: {
    paddingTop: PADDING_SIZE,
    paddingHorizontal: PADDING_SIZE,
  },
}));

export default ChainRenderer;
