import { useChainStore } from "@/stores/chain";
import ChainCard from "@/ui/components/cards/ChainCard";
import { useCallback, useMemo } from "react";
import { View } from "react-native";
import Sortable, {
  ActiveItemDroppedCallback,
  SortableGridRenderItem,
} from "react-native-sortables";
import { StyleSheet } from "react-native-unistyles";
import { GridItem } from "./types";
import { useChainDragStartegy } from "./useChainDragStartegy";
import { GHOST_NODE_PREFIX, snakifyArray, toLogical } from "./utils";

const COLUMNS = 3;

const ChainRenderer = () => {
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
      );
    },
    [],
  );

  return (
    <View style={styles.container}>
      <Sortable.Grid
        data={visualData}
        columns={COLUMNS}
        rowGap={32}
        columnGap={32}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        customHandle
        strategy={useChainDragStartegy}
        onActiveItemDropped={handleOrderChange}
      />
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    paddingTop: 24,
    paddingHorizontal: 48,
    flex: 1,
  },
}));

export default ChainRenderer;
