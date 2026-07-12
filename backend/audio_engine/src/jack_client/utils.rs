use std::{
  collections::HashSet,
  fs::{self, File},
  io::Write,
};

use anyhow::Result;
use jack::{Client, Error};
use shared::utils::app_data::get_connections_state_location;

use crate::jack_client::types::{ConnectionsState, EnginePortsNames};

pub fn save_connections_state(state: &ConnectionsState) {
  let file_location = get_connections_state_location();
  if let Ok(json) = serde_json::to_string_pretty(state) {
    if let Ok(mut file) = File::create(file_location) {
      let _ = file.write_all(json.as_bytes());
    }
  }
}
pub fn load_saved_connections_state() -> Option<ConnectionsState> {
  let config_path = get_connections_state_location();
  let json_content = fs::read_to_string(config_path).ok()?;
  let state: ConnectionsState = serde_json::from_str(&json_content).ok()?;

  Some(state)
}

pub fn handle_initial_ports_connections(
  client: &Client,
  engine_ports: &EnginePortsNames,
  connections_state: &ConnectionsState,
) -> Result<(), Error> {
  for out_port in &connections_state.connected_to_input {
    client.connect_ports_by_name(&out_port, &engine_ports.input)?;
  }

  let input_ports_l = connections_state
    .connected_to_output_l
    .iter()
    .collect::<Vec<_>>();

  let input_ports_r = connections_state
    .connected_to_output_r
    .iter()
    .collect::<Vec<_>>();

  for in_port in input_ports_l {
    client.connect_ports_by_name(&engine_ports.output_l, &in_port)?;
  }

  for in_port in input_ports_r {
    client.connect_ports_by_name(&engine_ports.output_r, &in_port)?;
  }

  Ok(())
}

pub fn calculate_port_diff(
  current: &HashSet<String>,
  desired: &[String],
) -> (Vec<String>, Vec<String>) {
  let to_add = desired
    .iter()
    .filter(|p| !current.contains(*p))
    .cloned()
    .collect();

  let to_remove = current
    .iter()
    .filter(|p| !desired.contains(p))
    .cloned()
    .collect();

  (to_add, to_remove)
}

pub fn apply_port_changes(
  client: &jack::Client,
  source_port: &str,
  to_add: &[String],
  to_remove: &[String],
) -> Result<(), Error> {
  for target_port in to_add {
    client.connect_ports_by_name(source_port, target_port)?;
  }

  for target_port in to_remove {
    client.disconnect_ports_by_name(source_port, target_port)?;
  }

  Ok(())
}
