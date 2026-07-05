use std::{
  fs::{self, File},
  io::Write,
};

use anyhow::Result;
use jack::Client;
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

pub fn connect_ports(
  client: &Client,
  engine_ports: &EnginePortsNames,
  output_ports: &Vec<String>,
  input_ports: &Vec<String>,
) -> Result<()> {
  for out_port in output_ports {
    client.connect_ports_by_name(&out_port, &engine_ports.input)?;
  }

  for in_port in input_ports {
    client.connect_ports_by_name(&engine_ports.output, &in_port)?;
  }
  Ok(())
}
