import { useAllPlugins } from "@/api/plugins";
import { Text } from "@/ui/components";
import LibraryPluginCard from "@/ui/components/cards/LibraryPluginCard";
import { FlatList, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

const LibraryScreen = () => {
  const { data } = useAllPlugins();
  return (
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
          <LibraryPluginCard name={plugin.name} effectClass={plugin.class} />
        </View>
      )}
    />
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

export default LibraryScreen;
