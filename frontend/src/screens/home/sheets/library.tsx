import { useAddPlugin, useAllPlugins } from "@/api/plugins";
import { PluginMetadata } from "@/api/plugins/types";
import { useChainStore } from "@/stores/chain";
import { Text } from "@/ui/components";
import LibraryPluginCard from "@/ui/components/cards/LibraryPluginCard";
import { useCallback } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { HomeScreenSheet, HomeScreenSheetProps } from "./shared";

type LibrarySheetProps = Omit<HomeScreenSheetProps, "children">;

const LibrarySheet = (props: LibrarySheetProps) => {
  const { data } = useAllPlugins();
  const { addNode, chain } = useChainStore();
  const { mutateAsync: addPlugin, isPending, variables } = useAddPlugin();

  const onPluginAdd = useCallback(
    async (plugin: PluginMetadata) => {
      try {
        const chainItem = await addPlugin({
          plugin_uri: plugin.uri,
          position: chain.length,
        });

        addNode(chainItem);
      } catch {
        toast.error("Failed to load the plugin");
      }
    },
    [addNode, addPlugin, chain.length],
  );

  const renderItem: ListRenderItem<PluginMetadata> = useCallback(
    ({ item: plugin }) => (
      <View style={styles.cardContainer}>
        <LibraryPluginCard
          name={plugin.name}
          effectClass={plugin.class}
          loading={variables?.plugin_uri === plugin.uri && isPending}
          disabled={isPending}
          onPress={() => onPluginAdd(plugin)}
        />
      </View>
    ),
    [isPending, onPluginAdd, variables?.plugin_uri],
  );

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
        renderItem={renderItem}
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
