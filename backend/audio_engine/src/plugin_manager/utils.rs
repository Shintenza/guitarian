use atomic_float::AtomicF32;
use jack::jack_sys::JackPortRegistrationCallback;
use livi::Plugin;
use shared::data::{ControlMetadata, ControlState, PluginMetadata};

use crate::plugin_manager::types::PortConfig;

pub fn get_lv2_plugin_controls_metadata(plugin: &Plugin) -> Vec<ControlMetadata> {
  let mut controls_metadata: Vec<ControlMetadata> = Vec::new();
  for port in plugin.ports_with_type(livi::PortType::ControlInput) {
    let metadata = ControlMetadata {
      id: port.index.0 as u16,
      name: port.name,
      min_value: port.min_value.unwrap_or_default(),
      max_value: port.max_value.unwrap_or_default(),
      default_value: port.default_value,
    };
    controls_metadata.push(metadata);
  }

  controls_metadata
}

pub fn get_lv2_plugin_metadata(plugin: &Plugin) -> PluginMetadata {
  let controls_metadata = get_lv2_plugin_controls_metadata(plugin);

  PluginMetadata {
    name: plugin.name(),
    uri: plugin.uri(),
    class: {
      let name = plugin.classes().nth(0).unwrap_or("UNKNOWN");
      name.strip_suffix(" Plugin").unwrap_or(name).to_string()
    },
    controls_metadata,
  }
}

pub fn controls_state_to_port_config(controls_state: &Vec<ControlState>) -> Vec<PortConfig> {
  controls_state
    .iter()
    .map(|state| PortConfig {
      id: state.id as usize,
      value: AtomicF32::new(state.value),
    })
    .collect()
}
