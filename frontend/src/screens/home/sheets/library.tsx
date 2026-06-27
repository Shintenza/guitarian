import { useAppendChainItem } from "@/api/chain";
import { useAllPlugins } from "@/api/plugins";
import { PluginMetadata } from "@/api/plugins/types";
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
  const {
    mutateAsync: appendChainItem,
    isPending,
    variables,
  } = useAppendChainItem();

  const onPluginAdd = useCallback(
    async (plugin: PluginMetadata) => {
      try {
        await appendChainItem({
          pluginUri: plugin.uri,
        });
      } catch {
        toast.error("Failed to load the plugin");
      }
    },
    [appendChainItem],
  );

  const renderItem: ListRenderItem<PluginMetadata> = useCallback(
    ({ item: plugin }) => (
      <View style={styles.cardContainer}>
        <LibraryPluginCard
          name={plugin.name}
          effectClass={plugin.class}
          loading={variables?.pluginUri === plugin.uri && isPending}
          disabled={isPending}
          onPress={() => onPluginAdd(plugin)}
        />
      </View>
    ),
    [isPending, onPluginAdd, variables?.pluginUri],
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
