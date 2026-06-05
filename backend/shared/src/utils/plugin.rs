use crate::data::{ChainItem, PresetItem};

pub fn chain_item_to_preset_item(chain_item: ChainItem) -> PresetItem {
  PresetItem {
    plugin_uri: chain_item.metadata.uri,
    controls_state: chain_item.controls_state,
  }
}
