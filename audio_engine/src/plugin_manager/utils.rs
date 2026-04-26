use livi::Plugin;

use crate::plugin_manager::audio_plugins::PortConfig;

pub fn get_plugin_ports_state(plugin: &Plugin) -> Vec<PortConfig> {
  let control_ports_count = plugin.port_counts().control_inputs;
  let mut state: Vec<PortConfig> = Vec::with_capacity(control_ports_count);

  for control_port in plugin.ports_with_type(livi::PortType::ControlInput) {
    let config = PortConfig {
      index: control_port.index,
      value: control_port.default_value,
    };
    state.push(config);
  }

  return state;
}
