use anyhow::Result;
use jack::{AsyncClient, AudioIn, AudioOut, Client, ClientOptions, PortFlags};
use ringbuf::HeapCons;
use std::env;
use std::sync::{Arc, Mutex};

use crate::jack_client::audio_processor::AudioProcessor;
use crate::jack_client::notification_handler::NotificationHandler;
use crate::jack_client::types::{ConnectionsState, EnginePortsNames};
use crate::jack_client::utils::{
  apply_port_changes, calculate_port_diff, handle_initial_ports_connections,
  load_saved_connections_state,
};
use crate::plugin_manager::types::AudioCommand;
use crate::utils::ports::{PortType, extract_unique_ports};

pub struct AudioEngine {
  connections_state: Arc<Mutex<ConnectionsState>>,
  ports_names: EnginePortsNames,
  async_client: AsyncClient<NotificationHandler, AudioProcessor>,
}

const DEFAULT_NAME_SERVER_NAME: &str = "guitarian";
const INPUT_NAME: &str = "in";
const OUTPUT_NAME_LEFT: &str = "out_L";
const OUTPUT_NAME_RIGHT: &str = "out_R";

impl AudioEngine {
  pub fn new(consumer: HeapCons<AudioCommand>) -> Self {
    let name =
      env::var("JACK_CLIENT_NAME").unwrap_or_else(|_| DEFAULT_NAME_SERVER_NAME.to_string());
    let (client, _status) = Client::new(&name, ClientOptions::default()).unwrap();

    let audio_in = client
      .register_port(INPUT_NAME, AudioIn::default())
      .unwrap();
    let audio_out_l = client
      .register_port(OUTPUT_NAME_LEFT, AudioOut::default())
      .unwrap();

    let audio_out_r = client
      .register_port(OUTPUT_NAME_RIGHT, AudioOut::default())
      .unwrap();

    let ports_names = EnginePortsNames {
      input: audio_in.name().unwrap(),
      output_l: audio_out_l.name().unwrap(),
      output_r: audio_out_r.name().unwrap(),
    };

    let processor = AudioProcessor::new(
      audio_in,
      audio_out_l,
      audio_out_r,
      consumer,
      client.buffer_size() as usize,
    );

    let state = load_saved_connections_state().unwrap_or_default();

    let _ = handle_initial_ports_connections(&client, &ports_names, &state);
    let guarded_state = Arc::new(Mutex::new(state));

    let notification_handler = NotificationHandler::new(ports_names.clone(), guarded_state.clone());

    let async_client = client
      .activate_async(notification_handler, processor)
      .unwrap();

    Self {
      connections_state: guarded_state,
      ports_names,
      async_client: async_client,
    }
  }

  pub fn sample_rate(&self) -> u32 {
    self.async_client.as_client().sample_rate()
  }

  fn get_ports(&self, port_type: PortType, name: Option<&String>) -> Vec<String> {
    let audio_type = "32 bit float mono audio";
    let mut flags = PortFlags::IS_TERMINAL | PortFlags::IS_PHYSICAL;
    match port_type {
      PortType::Input => {
        flags.insert(PortFlags::IS_INPUT);
      }
      PortType::Output => {
        flags.insert(PortFlags::IS_OUTPUT);
      }
    }

    let pattern: Option<String> = name.map(|n| {
      let safe_n = n.replace("(", r"\(").replace(")", r"\)");
      match port_type {
        PortType::Output => safe_n.clone(),
        PortType::Input => format!("^{safe_n}:"),
      }
    });

    self
      .async_client
      .as_client()
      .ports(pattern.as_deref(), Some(audio_type), flags)
  }

  pub fn get_audio_devices(&self) -> (Vec<String>, Vec<String>) {
    let input_ports = self.get_ports(PortType::Input, None);
    let output_ports = self.get_ports(PortType::Output, None);
    let input_devices = extract_unique_ports(input_ports, PortType::Input);
    let output_devices = extract_unique_ports(output_ports, PortType::Output);
    return (input_devices, output_devices);
  }

  pub fn get_current_connections_state(&self) -> Result<ConnectionsState> {
    let state = self.connections_state.lock().unwrap();
    return Ok(state.clone());
  }

  pub fn set_audio_connections(
    &self,
    audio_source_port: String,
    destination_devices: Vec<String>,
  ) -> Result<()> {
    let client = self.async_client.as_client();

    let client_in_port = client.port_by_name(&self.ports_names.input).unwrap();

    let mut desired_out_l: Vec<String> = Vec::new();
    let mut desired_out_r: Vec<String> = Vec::new();

    for device in &destination_devices {
      let device_ports = self.get_ports(PortType::Input, Some(device));

      if device_ports.is_empty() {
        continue;
      }

      if device_ports.len() == 1 {
        desired_out_l.push(device_ports[0].clone());
        desired_out_r.push(device_ports[0].clone());
      } else {
        desired_out_l.push(device_ports[0].clone());
        desired_out_r.push(device_ports[1].clone());
      }
    }

    let (needs_input_change, add_l, rem_l, add_r, rem_r) = {
      let state = self.connections_state.lock().unwrap();

      let needs_input = match &state.connected_to_input {
        Some(current) => *current != audio_source_port,
        None => true,
      };

      let (a_l, r_l) = calculate_port_diff(&state.connected_to_output_l, &desired_out_l);
      let (a_r, r_r) = calculate_port_diff(&state.connected_to_output_r, &desired_out_r);

      (needs_input, a_l, r_l, a_r, r_r)
    };

    if needs_input_change {
      self.async_client.as_client().disconnect(&client_in_port)?;
      self
        .async_client
        .as_client()
        .connect_ports_by_name(&audio_source_port, &self.ports_names.input)?;
    }

    apply_port_changes(client, &self.ports_names.output_l, &add_l, &rem_l)?;
    apply_port_changes(client, &self.ports_names.output_r, &add_r, &rem_r)?;
    Ok(())
  }
}
