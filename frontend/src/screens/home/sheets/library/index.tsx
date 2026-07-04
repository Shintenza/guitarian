import { useAppendChainItem } from "@/api/chain";
import { PluginMetadata } from "@/api/plugins/types";
import { EffectClass } from "@/types/plugins";
import {
  ControlledInput,
  ControlledSelectablePills,
  IconButton,
  Text,
} from "@/ui/components";
import LibraryPluginCard from "@/ui/components/cards/LibraryPluginCard";
import { SelectablePillConfig } from "@/ui/components/form/uncontrolled/SelectablePills";
import HiddenContent from "@/ui/components/HiddenContent";
import { effectUI } from "@/ui/effects/definitions";
import { snakeToTitleCase } from "@/utils/text";
import { useCallback } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { toast } from "sonner-native";
import { HomeScreenSheet, HomeScreenSheetProps } from "./../shared";
import useLibrarySearch from "./useLibrarySearch";

type LibrarySheetProps = Omit<HomeScreenSheetProps, "children">;

const LibrarySheet = (props: LibrarySheetProps) => {
  const {
    queryResult,
    form: { control },
  } = useLibrarySearch();
  const { data } = queryResult;
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

  const pillsData: SelectablePillConfig<EffectClass>[] = Object.entries(
    effectUI,
  ).map(([key, value]) => ({
    label: snakeToTitleCase(key),
    value: key as EffectClass,
    color: value.color,
  }));

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
            <HiddenContent
              header={({ opened, toggle }) => (
                <View style={styles.headerRow}>
                  <ControlledInput
                    containerStyle={styles.inputContainerStyle}
                    control={control}
                    name="name"
                    placeholder="e.g. Rat"
                  />
                  <IconButton
                    variant={opened ? "solid" : "outline"}
                    rounded={false}
                    iconName="tune"
                    onPress={toggle}
                    style={styles.iconButtonStyle}
                  />
                </View>
              )}
            >
              <ControlledSelectablePills
                name="class"
                control={control}
                data={pillsData}
              />
            </HiddenContent>
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
  headerRow: {
    flexDirection: "row",
    gap: 4,
  },
  inputContainerStyle: {
    flex: 1,
  },
  iconButtonStyle: {
    alignSelf: "flex-end",
    padding: 11,
    marginBottom: 1,
  },
});

export default LibrarySheet;
