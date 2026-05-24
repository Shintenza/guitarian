use ringbuf::{HeapProd, traits::Producer};
use std::sync::{Arc, atomic::Ordering};

use crate::plugin_manager::{
  audio_plugins::{AudioCommand, PluginConfig, PluginInstanceWithId, PortConfig},
  plugin_instance::PluginInstance,
};

pub struct PluginChain {
  producer: HeapProd<AudioCommand>,
  chain: Vec<PluginConfig>,
  plugin_id: u32,
}

impl PluginChain {
  pub fn new(producer: HeapProd<AudioCommand>) -> Self {
    let chain: Vec<PluginConfig> = Vec::new();
    let plugin_id = 0;
    Self {
      producer,
      chain,
      plugin_id,
    }
  }

  pub fn add_plugin(
    &mut self,
    index: usize,
    instance: impl PluginInstance,
    state: Vec<PortConfig>,
  ) {
    let state_arc = Arc::new(state);
    let safe_index = index.min(self.chain.len());

    let plugin_meta = PluginConfig {
      id: self.plugin_id,
      state: state_arc.clone(),
    };

    let command = AudioCommand::AddPlugin(
      index,
      PluginInstanceWithId {
        id: self.plugin_id,
        instance: Box::new(instance),
      },
    );

    self.producer.try_push(command);
    self.chain.insert(safe_index, plugin_meta);
  }

  pub fn remove_plugin(&mut self, plugin_id: u32) {
    self
      .producer
      .try_push(AudioCommand::RemovePlugin(plugin_id));
    if let Some(index) = self.chain.iter().position(|p| p.id == 2) {
      self.chain.remove(index);
    }
  }

  pub fn set_plugin_port_value(&self, plugin_id: u32, port_id: u32, new_value: f32) {
    let Some(plugin) = self.chain.iter().find(|plugin| plugin.id == plugin_id) else {
      return
    };

    let Some(port) = plugin.state.iter().find(|item| item.id == port_id as usize) else {
      return;
    };

    port.value.store(new_value, Ordering::Relaxed);
  }
}
