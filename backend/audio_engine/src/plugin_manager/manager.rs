use std::sync::atomic::Ordering;

use ringbuf::HeapProd;
use shared::data::{ChainItem, ControlState, PluginMetadata};

use crate::plugin_manager::plugin_chain::PluginChain;
use crate::plugin_manager::plugin_repository::{LV2PluginRepository, PluginRepository};
use crate::plugin_manager::types::{AudioCommand, PluginActionError};

pub struct PluginManager {
  sample_rate: u32,
  lv2_repository: LV2PluginRepository,
  plugin_chain: PluginChain,
  plugin_id: u32,
}

impl PluginManager {
  pub fn new(sample_rate: u32, producer: HeapProd<AudioCommand>) -> Self {
    let plugin_id = 0;
    let lv2_repository = LV2PluginRepository::new(sample_rate);
    let plugin_chain = PluginChain::new(producer);

    PluginManager {
      lv2_repository,
      plugin_chain,
      sample_rate,
      plugin_id,
    }
  }

  pub fn get_plugins(&self) -> Vec<PluginMetadata> {
    let plugins = self.lv2_repository.get_all_plugins();
    plugins
  }

  pub fn set_plugin_port_value(&self, plugin_id: u32, port_id: u32, new_value: f32) {
    self
      .plugin_chain
      .set_plugin_port_value(plugin_id, port_id, new_value);
  }

  pub fn unload_plugin(&mut self, id: u32) -> Result<(), PluginActionError> {
    self.plugin_chain.remove_plugin(id);
    Ok(())
  }

  pub fn load_plugin(&mut self, position: usize, uri: &str) -> Result<(), PluginActionError> {
    let state = self
      .lv2_repository
      .get_plugin_default_port_values(uri)
      .ok_or(PluginActionError::NotFound)?;
    let plugin_instance = self
      .lv2_repository
      .get_plugin_instance(uri)
      .ok_or(PluginActionError::NotFound)?;

    self
      .plugin_chain
      .add_plugin(position, plugin_instance, state, uri);
    Ok(())
  }

  pub fn get_current_chain_state(&self) -> Vec<ChainItem> {
    let mut chain_state: Vec<ChainItem> = Vec::new();
    let current_state = self.plugin_chain.get_current_chain();

    for state_item in current_state {
      let plugin_metadata = self
        .lv2_repository
        .get_plugin_metadata(&state_item.plugin_uri).unwrap();

      let plugin_controls_state: Vec<ControlState> = state_item
        .state
        .iter()
        .map(|item| ControlState {
          id: item.id as u16,
          value: item.value.load(Ordering::Relaxed),
        })
        .collect();
      let chain_item = ChainItem {
        id: state_item.id as u16,
        metadata: plugin_metadata,
        controls_state: plugin_controls_state
      };
      chain_state.push(chain_item);
    }

    chain_state
  }
}
