use livi::Plugin;
use shared::data::{ControlMetadata, PluginMetadata};

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
    class: plugin.classes().nth(0).unwrap_or("UNKOWN").to_string(),
    controls_metadata,
  }
}
