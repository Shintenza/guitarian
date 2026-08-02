use shared::data::{ControlState, PresetItem};
use shared::utils::app_data::get_chain_dump_location;
use std::sync::atomic::Ordering;
use std::time::Duration;

use crate::plugin_manager::types::InstanceConfig;
use crate::utils::debounced_saver::{DebouncedSaver, read_json};

const SAVE_DEBOUNCE_MS: u64 = 300;

pub struct ChainSaver {
  saver: DebouncedSaver<Vec<PresetItem>>,
}

impl ChainSaver {
  pub fn new() -> Self {
    Self {
      saver: DebouncedSaver::new(
        get_chain_dump_location(),
        Duration::from_millis(SAVE_DEBOUNCE_MS),
      ),
    }
  }

  pub fn load_preset_from_disk() -> Option<Vec<PresetItem>> {
    read_json(&get_chain_dump_location())
  }

  pub fn request_save(&self, chain: Vec<InstanceConfig>) {
    let preset: Vec<PresetItem> = chain
      .into_iter()
      .map(|config| {
        let controls_state = config
          .state
          .iter()
          .map(|item| ControlState {
            id: item.id as u16,
            value: item.value.load(Ordering::Relaxed),
          })
          .collect();

        PresetItem {
          plugin_uri: config.plugin_uri,
          controls_state,
        }
      })
      .collect();

    self.saver.request_save(preset);
  }
}
