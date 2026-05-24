use std::sync::Arc;

use atomic_float::AtomicF32;
use livi::{Features, World, event::LV2AtomSequence};
use shared::data::PluginMetadata;

use crate::plugin_manager::{audio_plugins::{ PortConfig}, plugin_instance::{
  AtomSequencePorts, LV2PluginInstance, PluginInstance,
}};

pub trait PluginRepository {
  fn get_all_plugins(&self) -> Vec<PluginMetadata>;
  fn get_plugin_instance(&self, plugin_id: &str) -> Option<impl PluginInstance>;
  fn get_plugin_default_port_values(&self, plugin_id: &str) -> Option<Vec<PortConfig>>;
}

pub struct LV2PluginRepository {
  world: World,
  sample_rate: u32,
  features: Arc<Features>,
}

impl LV2PluginRepository {
  pub fn new(sample_rate: u32) -> Self {
    let world = livi::World::new();
    let features = world.build_features(livi::FeaturesBuilder::default());

    Self {
      world,
      sample_rate,
      features,
    }
  }
}

impl PluginRepository for LV2PluginRepository {
  fn get_all_plugins(&self) -> Vec<PluginMetadata> {
    let mut plugins: Vec<PluginMetadata> = Vec::new();

    for plugin in self.world.iter_plugins() {
      if plugin.is_instrument() {
        continue;
      }

      let name = plugin.name();
      let uri = plugin.uri();
      let class = plugin.classes().nth(0).unwrap_or("UNKOWN");

      plugins.push(PluginMetadata {
        name,
        uri,
        class: class.to_string(),
      });
    }

    plugins
  }

  fn get_plugin_instance(&self, plugin_id: &str) -> Option<impl PluginInstance> {
    let plugin = self.world.plugin_by_uri(&plugin_id)?;

    let instance = unsafe {
      plugin
        .instantiate(self.features.clone(), self.sample_rate as f64)
        .ok()?
    };

    let seq_in = LV2AtomSequence::new(&self.features, 1024);
    let seq_out = LV2AtomSequence::new(&self.features, 1024);
    let atom_seq_ports = AtomSequencePorts { seq_in, seq_out };
    let plugin_instance = LV2PluginInstance::new(instance, atom_seq_ports);

    Some(plugin_instance)
  }

  fn get_plugin_default_port_values(&self, plugin_id: &str) -> Option<Vec<PortConfig>> {
    let plugin = self.world.plugin_by_uri(&plugin_id)?;
    let number_of_ports = plugin.port_counts();

    let mut state: Vec<PortConfig> = Vec::with_capacity(number_of_ports.control_inputs);

    for control_port in plugin.ports_with_type(livi::PortType::ControlInput) {
      let config = PortConfig {
        id: control_port.index.0,
        value: AtomicF32::new(control_port.default_value)
      };
      state.push(config);
    }

    Some(state)
  }
}
