use std::sync::atomic::Ordering;

use ringbuf::HeapProd;
use shared::data::{ChainItem, ControlState, PluginMetadata, PluginQuery, PresetItem};

use crate::plugin_manager::chain_saver::ChainSaver;
use crate::plugin_manager::plugin_chain::PluginChain;
use crate::plugin_manager::plugin_repository::{LV2PluginRepository, PluginRepository};
use crate::plugin_manager::types::{
  AudioCommand, ChainOperationError, InitializedPlugin, InstanceConfig,
};

pub struct PluginManager {
  lv2_repository: LV2PluginRepository,
  plugin_chain: PluginChain,
  chain_saver: ChainSaver,
}

impl PluginManager {
  pub fn new(sample_rate: u32, producer: HeapProd<AudioCommand>) -> Self {
    let lv2_repository = LV2PluginRepository::new(sample_rate);
    let plugin_chain = PluginChain::new(producer);
    let chain_saver = ChainSaver::new();

    let mut manager = PluginManager {
      lv2_repository,
      plugin_chain,
      chain_saver,
    };

    if let Some(dump) = ChainSaver::load_preset_from_disk() {
      let _ = manager.load_preset(dump);
    }

    manager
  }

  fn instance_config_to_chain_item(&self, instance_config: InstanceConfig) -> ChainItem {
    let plugin_metadata = self
      .lv2_repository
      .get_plugin_metadata(&instance_config.plugin_uri)
      .unwrap();

    let plugin_controls_state: Vec<ControlState> = instance_config
      .state
      .iter()
      .map(|item| ControlState {
        id: item.id as u16,
        value: item.value.load(Ordering::Relaxed),
      })
      .collect();
    ChainItem {
      id: instance_config.id as u16,
      metadata: plugin_metadata,
      controls_state: plugin_controls_state,
    }
  }

  pub fn get_plugins(&self, query: PluginQuery) -> Vec<PluginMetadata> {
    let plugins = self.lv2_repository.get_all_plugins(query.filters);
    plugins
  }

  fn trigger_save(&self) {
    let current_chain = self.plugin_chain.get_current_chain();
    self.chain_saver.request_save(current_chain);
  }

  pub fn clear(&mut self) -> Result<(), ChainOperationError> {
    self.plugin_chain.clear()?;
    self.trigger_save();
    Ok(())
  }

  pub fn change_plugin_position(
    &mut self,
    plugin_id: u32,
    new_position: usize,
  ) -> Result<(), ChainOperationError> {
    self
      .plugin_chain
      .change_plugin_position(plugin_id, new_position)?;
    self.trigger_save();
    Ok(())
  }

  pub fn set_plugin_port_value(&self, plugin_id: u32, port_id: u32, new_value: f32) {
    self
      .plugin_chain
      .set_plugin_port_value(plugin_id, port_id, new_value);
    self.trigger_save();
  }

  pub fn unload_plugin(&mut self, id: u32) -> Result<(), ChainOperationError> {
    self.plugin_chain.remove_plugin(id)?;
    self.trigger_save();
    Ok(())
  }

  pub fn load_plugin(
    &mut self,
    position: usize,
    uri: &str,
  ) -> Result<ChainItem, ChainOperationError> {
    let initialized_plugin = self
      .lv2_repository
      .get_initialized_plugin(uri)
      .ok_or(ChainOperationError::NotFound)?;

    let result = self.plugin_chain.add_plugin(position, initialized_plugin);
    self.trigger_save();
    Ok(self.instance_config_to_chain_item(result))
  }

  pub fn get_current_chain_state(&self) -> Vec<ChainItem> {
    let mut chain_state: Vec<ChainItem> = Vec::new();
    let current_state = self.plugin_chain.get_current_chain();

    for state_item in current_state {
      let chain_item = self.instance_config_to_chain_item(state_item);
      chain_state.push(chain_item);
    }

    chain_state
  }

  pub fn load_preset(
    &mut self,
    preset: Vec<PresetItem>,
  ) -> Result<Vec<ChainItem>, ChainOperationError> {
    let mut initialized_plugins: Vec<InitializedPlugin> = Vec::with_capacity(preset.len());

    for preset_item in preset {
      let plugin_instance = self
        .lv2_repository
        .get_plugin_instance(&preset_item.plugin_uri)
        .ok_or(ChainOperationError::NotFound)?;
      initialized_plugins.push(InitializedPlugin {
        instance: Box::new(plugin_instance),
        plugin_uri: preset_item.plugin_uri,
        state: preset_item.controls_state,
      })
    }

    let load_result = self.plugin_chain.load_preset(initialized_plugins);
    let chain_items = load_result
      .into_iter()
      .map(|item| self.instance_config_to_chain_item(item))
      .collect();

    self.trigger_save();
    Ok(chain_items)
  }
}
