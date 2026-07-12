use std::sync::Arc;

use livi::{Features, World, event::LV2AtomSequence};
use shared::data::{ControlState, PluginFilters, PluginMetadata};

use crate::plugin_manager::{
  plugin_instance::{AtomSequencePorts, LV2PluginInstance, PluginInstance},
  types::InitializedPlugin,
  utils::{get_lv2_plugin_controls_metadata, get_lv2_plugin_metadata},
};

pub trait PluginRepository {
  fn get_all_plugins(&self, filters: Option<PluginFilters>) -> Vec<PluginMetadata>;
  fn get_plugin_instance(&self, plugin_uri: &str) -> Option<impl PluginInstance>;
  fn get_initialized_plugin(&self, plugin_uri: &str) -> Option<InitializedPlugin>;
  fn get_plugin_default_port_values(&self, plugin_uri: &str) -> Option<Vec<ControlState>>;
  fn get_plugin_metadata(&self, plugin_uri: &str) -> Option<PluginMetadata>;
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
  fn get_plugin_metadata(&self, plugin_uri: &str) -> Option<PluginMetadata> {
    let plugin = self.world.plugin_by_uri(&plugin_uri)?;
    Some(get_lv2_plugin_metadata(&plugin))
  }

  fn get_all_plugins(&self, filters: Option<PluginFilters>) -> Vec<PluginMetadata> {
    let mut plugins: Vec<PluginMetadata> = Vec::new();

    for plugin in self.world.iter_plugins() {
      if plugin.is_instrument() {
        continue;
      }

      let plugin_metadata = get_lv2_plugin_metadata(&plugin);

      if let Some(filter) = &filters {
        let name_fails = filter.name.as_ref().is_some_and(|name| {
          !plugin_metadata
            .name
            .to_lowercase()
            .contains(&name.to_lowercase())
        });

        let class_fails = filter
          .class
          .as_ref()
          .is_some_and(|class| !class.contains(&plugin_metadata.class));

        let uri_fails = filter
          .uri
          .as_ref()
          .is_some_and(|uri| uri.contains(&plugin_metadata.uri));

        if class_fails || name_fails || uri_fails {
          continue;
        }
      }

      plugins.push(plugin_metadata);
    }

    plugins
  }

  fn get_plugin_instance(&self, plugin_uri: &str) -> Option<impl PluginInstance> {
    let plugin = self.world.plugin_by_uri(&plugin_uri)?;

    let instance = unsafe {
      plugin
        .instantiate(self.features.clone(), self.sample_rate as f64)
        .ok()?
    };

    let seq_in = LV2AtomSequence::new(&self.features, 1024);
    let seq_out = LV2AtomSequence::new(&self.features, 1024);
    let atom_seq_ports = AtomSequencePorts { seq_in, seq_out };
    let plugin_instance = LV2PluginInstance::new(instance, *plugin.port_counts(), atom_seq_ports);

    Some(plugin_instance)
  }

  fn get_initialized_plugin(&self, plugin_uri: &str) -> Option<InitializedPlugin> {
    let plugin_instance = self.get_plugin_instance(plugin_uri)?;
    let state = self.get_plugin_default_port_values(plugin_uri)?;

    Some(InitializedPlugin {
      plugin_uri: plugin_uri.to_string(),
      state,
      instance: Box::new(plugin_instance),
    })
  }

  fn get_plugin_default_port_values(&self, plugin_uri: &str) -> Option<Vec<ControlState>> {
    let plugin = self.world.plugin_by_uri(&plugin_uri)?;
    let number_of_ports = plugin.port_counts();

    let mut state: Vec<ControlState> = Vec::with_capacity(number_of_ports.control_inputs);

    let controls_metadata = get_lv2_plugin_controls_metadata(&plugin);

    for control_port in controls_metadata {
      let config = ControlState {
        id: control_port.id as u16,
        value: control_port.default_value,
      };
      state.push(config);
    }

    Some(state)
  }
}
