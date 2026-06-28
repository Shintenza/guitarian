use ringbuf::{HeapProd, traits::Producer};
use std::{
  io::Chain,
  sync::{Arc, atomic::Ordering},
};

use crate::{
  plugin_manager::{
    types::{
      AudioCommand, ChainOperationError, InitializedPlugin, InstanceConfig, PluginInstanceWithId,
    },
    utils::controls_state_to_port_config,
  },
  utils::vector::move_item,
};

pub struct PluginChain {
  producer: HeapProd<AudioCommand>,
  chain: Vec<InstanceConfig>,
  plugin_id: u32,
}

impl PluginChain {
  pub fn new(producer: HeapProd<AudioCommand>) -> Self {
    let chain: Vec<InstanceConfig> = Vec::new();
    let plugin_id = 0;
    Self {
      producer,
      chain,
      plugin_id,
    }
  }

  pub fn get_current_chain(&self) -> Vec<InstanceConfig> {
    return self.chain.clone();
  }

  fn get_plugin_instance_config(plugin: &InitializedPlugin, plugin_id: u32) -> InstanceConfig {
    let state_arc = Arc::new(controls_state_to_port_config(&plugin.state));

    InstanceConfig {
      id: plugin_id,
      state: state_arc.clone(),
      plugin_uri: plugin.plugin_uri.to_string(),
    }
  }

  pub fn add_plugin(&mut self, index: usize, mut plugin: InitializedPlugin) -> InstanceConfig {
    let instance_config = PluginChain::get_plugin_instance_config(&plugin, self.plugin_id);
    // TODO handle negative values
    let safe_index = index.min(self.chain.len());
    plugin
      .instance
      .set_port_values_source(instance_config.state.clone());

    let command = AudioCommand::AddPlugin(
      index,
      PluginInstanceWithId {
        id: self.plugin_id,
        instance: plugin.instance,
      },
    );

    self.producer.try_push(command);
    self.chain.insert(safe_index, instance_config.clone());
    self.plugin_id += 1;

    instance_config
  }

  pub fn remove_plugin(&mut self, plugin_id: u32) {
    self
      .producer
      .try_push(AudioCommand::RemovePlugin(plugin_id));
    if let Some(index) = self.chain.iter().position(|p| p.id == plugin_id) {
      self.chain.remove(index);
    }
  }

  pub fn change_plugin_position(
    &mut self,
    plugin_id: u32,
    new_position: usize,
  ) -> Result<(), ChainOperationError> {
    let exists = self.chain.iter().any(|x| x.id == plugin_id);
    if !exists {
      return Err(ChainOperationError::InvalidArguments);
    }

    if new_position as usize >= self.chain.len() {
      return Err(ChainOperationError::InvalidArguments);
    }

    self
      .producer
      .try_push(AudioCommand::ChangePluginPosition(plugin_id, new_position))
      .map_err(|_| ChainOperationError::BufferError)?;

    let _ = move_item(&mut self.chain, new_position, |item| item.id == plugin_id);

    Ok(())
  }

  pub fn clear(&mut self) -> Result<(), ChainOperationError> {
    self
      .producer
      .try_push(AudioCommand::RemoveAll)
      .map_err(|_| ChainOperationError::BufferError)?;
    self.chain.clear();
    Ok(())
  }

  pub fn set_plugin_port_value(&self, plugin_id: u32, port_id: u32, new_value: f32) {
    let Some(plugin) = self.chain.iter().find(|plugin| plugin.id == plugin_id) else {
      return;
    };

    let Some(port) = plugin.state.iter().find(|item| item.id == port_id as usize) else {
      return;
    };

    port.value.store(new_value, Ordering::Relaxed);
  }

  pub fn load_preset(&mut self, preset: Vec<InitializedPlugin>) -> Vec<InstanceConfig> {
    let (i_config, i_id): (Vec<InstanceConfig>, Vec<PluginInstanceWithId>) = preset
      .into_iter()
      .enumerate()
      .map(|(index, plugin)| {
        (
          PluginChain::get_plugin_instance_config(&plugin, index as u32),
          PluginInstanceWithId {
            id: index as u32,
            instance: plugin.instance,
          },
        )
      })
      .unzip();

    // TODO revert these operations once try_push fails
    self.plugin_id = i_config.len() as u32;
    self.chain = i_config.clone();

    let command = AudioCommand::LoadPreset(i_id);

    self.producer.try_push(command);
    i_config
  }
}
