use std::collections::HashMap;
use ringbuf::HeapProd;
use shared::data::PluginMetadata;

use crate::plugin_manager::audio_plugins::{AudioCommand, PluginActionError, PluginConfig};
use crate::plugin_manager::plugin_chain::PluginChain;
use crate::plugin_manager::plugin_repository::{LV2PluginRepository, PluginRepository};

pub struct PluginManager {
  sample_rate: u32,
  lv2_repository: LV2PluginRepository,
  plugin_chain: PluginChain,

  plugin_register: HashMap<u32, PluginConfig>,
  plugin_id: u32,
}

impl PluginManager {
  pub fn new(sample_rate: u32, producer: HeapProd<AudioCommand>) -> Self {
    let plugin_id = 0;
    let plugin_register: HashMap<u32, PluginConfig> = HashMap::new();
    let lv2_repository = LV2PluginRepository::new(sample_rate);
    let plugin_chain = PluginChain::new(producer);

    PluginManager {
      lv2_repository,
      plugin_chain,
      sample_rate,
      plugin_id,
      plugin_register,
    }
  }

  pub fn get_plugins(&self) -> Vec<PluginMetadata> {
    let plugins = self.lv2_repository.get_all_plugins();
    plugins
  }

  pub fn set_plugin_port_value(&self, plugin_id: u32, port_id: u32, new_value: f32) {
    self.plugin_chain.set_plugin_port_value(plugin_id, port_id, new_value);
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

    self.plugin_chain.add_plugin(position, plugin_instance, state);
    Ok(())
  }
}
