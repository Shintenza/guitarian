use atomic_float::AtomicF32;
use heck::ToSnakeCase;
use livi::{Plugin, PortValueType, ScalePoints};
use shared::data::{
  ControlMetadata, ControlState, ControlType, PluginClass, PluginMetadata, ScalePoint,
};
use std::str::FromStr;

use crate::plugin_manager::types::PortConfig;

pub fn get_control_type(port_value: &PortValueType) -> ControlType {
  match port_value {
    PortValueType::Continuous => ControlType::Continuous,
    PortValueType::Integer => ControlType::Integer,
    PortValueType::Toggled => ControlType::Toggled,
    PortValueType::Enumeration => ControlType::Enumeration,
  }
}

pub fn get_plugin_class(class_name: &str) -> PluginClass {
  let normalized = class_name.trim().to_snake_case();
  let plugin_class = PluginClass::from_str(&normalized).unwrap_or(PluginClass::Other);

  plugin_class
}

pub fn get_scale_points_vec(scale_points: ScalePoints) -> Vec<ScalePoint> {
  scale_points
    .into_iter()
    .map(|sp| {
      let label = sp.label().as_str().unwrap_or("").to_string();
      let value = sp.value().as_int().unwrap_or(0);
      ScalePoint { label, value }
    })
    .collect()
}

pub fn get_lv2_plugin_controls_metadata(plugin: &Plugin) -> Vec<ControlMetadata> {
  let mut controls_metadata: Vec<ControlMetadata> = Vec::new();
  for port in plugin.ports_with_type(livi::PortType::ControlInput) {
    let metadata = ControlMetadata {
      id: port.index.0 as u16,
      name: port.name,
      min_value: port.min_value.unwrap_or_default(),
      max_value: port.max_value.unwrap_or_default(),
      default_value: port.default_value,
      control_type: get_control_type(&port.port_value_type),
      scale_points: get_scale_points_vec(port.scale_points),
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
      let cleaned_name = name.strip_suffix(" Plugin").unwrap_or(name);
      get_plugin_class(cleaned_name)
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
