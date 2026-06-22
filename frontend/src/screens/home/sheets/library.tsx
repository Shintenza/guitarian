import { useAllPlugins } from "@/api/plugins";
import { useChainStore } from "@/stores/chain";
import { Text } from "@/ui/components";
import LibraryPluginCard from "@/ui/components/cards/LibraryPluginCard";
import { FlatList, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { HomeScreenSheet, HomeScreenSheetProps } from "./shared";

type LibrarySheetProps = Omit<HomeScreenSheetProps, "children">;

const LibrarySheet = (props: LibrarySheetProps) => {
  const { data } = useAllPlugins();
  const { addNode } = useChainStore();
  return (
    <HomeScreenSheet {...props}>
      <FlatList
        data={data}
        nestedScrollEnabled
        keyExtractor={(plugin) => plugin.uri}
        numColumns={2}
        contentContainerStyle={styles.container}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text variant="bold" size="H1">
              Library
            </Text>
          </View>
        }
        renderItem={({ item: plugin }) => (
          <View style={styles.cardContainer}>
            <LibraryPluginCard
              name={plugin.name}
              effectClass={plugin.class}
              onPress={() => addNode(plugin)}
            />
          </View>
        )}
      />
    </HomeScreenSheet>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
  },
  container: {
    padding: 24,
    gap: 8,
  },
  columnWrapper: {
    gap: 8,
  },
  cardContainer: {
    flex: 1,
  },
});

export default LibrarySheet;
