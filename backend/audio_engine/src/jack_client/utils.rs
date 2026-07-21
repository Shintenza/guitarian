use std::collections::HashSet;

use anyhow::Result;
use jack::{Client, Error};
use shared::data::BufferSize;

use crate::jack_client::{engine_settings::EngineSettings, types::EnginePortsNames};

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

pub fn sync_engine_settings_with_client(
  engine_settings: &mut EngineSettings,
  client: &Client,
  engine_ports: &EnginePortsNames,
) {
  if let Err(_) = client.set_buffer_size(engine_settings.buffer_size as u32) {
    let default_buffer_size = BufferSize::default();
    client.set_buffer_size(default_buffer_size as u32).unwrap();
    engine_settings.buffer_size = default_buffer_size;
  }

  if let Some(out_port) = &engine_settings.connections_state.connected_to_input {
    if let Err(_) = client.connect_ports_by_name(&out_port, &engine_ports.input) {
      engine_settings.connections_state.connected_to_input = None;
    }
  }

  let wire_inputs = |ports_set: &mut HashSet<String>, engine_port: &String| {
    ports_set.retain(|port_name| client.connect_ports_by_name(engine_port, port_name).is_ok());
  };

  wire_inputs(
    &mut engine_settings.connections_state.connected_to_output_l,
    &engine_ports.output_l,
  );

  wire_inputs(
    &mut engine_settings.connections_state.connected_to_output_r,
    &engine_ports.output_r,
  );

  let _ = engine_settings.save();
}
