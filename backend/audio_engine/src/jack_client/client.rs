use anyhow::Result;
use jack::{AsyncClient, AudioIn, AudioOut, Client, ClientOptions, PortFlags};
use ringbuf::HeapCons;
use std::env;
use std::sync::{Arc, Mutex};

use crate::jack_client::audio_processor::AudioProcessor;
use crate::jack_client::notification_handler::NotificationHandler;
use crate::jack_client::types::{ConnectionsState, EnginePortsNames};
use crate::jack_client::utils::{connect_ports, load_saved_connections_state};
use crate::plugin_manager::types::AudioCommand;
use crate::utils::ports::{PortType, extract_unique_ports};

pub struct AudioEngine {
  connections_state: Arc<Mutex<ConnectionsState>>,
  ports_names: EnginePortsNames,
  async_client: AsyncClient<NotificationHandler, AudioProcessor>,
}

const DEFAULT_NAME_SERVER_NAME: &str = "guitarian";
const INPUT_NAME: &str = "in";
const OUTPUT_NAME: &str = "out";

impl AudioEngine {
  pub fn new(consumer: HeapCons<AudioCommand>) -> Self {
    let name =
      env::var("JACK_CLIENT_NAME").unwrap_or_else(|_| DEFAULT_NAME_SERVER_NAME.to_string());
    let (client, _status) = Client::new(&name, ClientOptions::default()).unwrap();

    let audio_in = client
      .register_port(INPUT_NAME, AudioIn::default())
      .unwrap();
    let audio_out = client
      .register_port(OUTPUT_NAME, AudioOut::default())
      .unwrap();

    let ports_names = EnginePortsNames {
      input: audio_in.name().unwrap(),
      output: audio_out.name().unwrap(),
    };

    let processor =
      AudioProcessor::new(audio_in, audio_out, consumer, client.buffer_size() as usize);

    let state = load_saved_connections_state().unwrap_or_default();

    let _ = connect_ports(
      &client,
      &ports_names,
      &state.connected_to_input.iter().cloned().collect::<Vec<_>>(),
      &state
        .connected_to_output
        .iter()
        .cloned()
        .collect::<Vec<_>>(),
    );
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

    let pattern: Option<String> = name.map(|n| match port_type {
      PortType::Output => n.clone(),
      PortType::Input => format!("^{n}:"),
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
    let client_in_port = self
      .async_client
      .as_client()
      .port_by_name(&self.ports_names.input)
      .unwrap();

    let destination_devices_ports = destination_devices
      .iter()
      .flat_map(|item| self.get_ports(PortType::Input, Some(item)))
      .collect::<Vec<String>>();

    let needs_input_change: bool;
    let to_be_added: Vec<String>;
    let to_be_removed: Vec<String>;

    {
      let connections_state = self.connections_state.lock().unwrap();

      needs_input_change = match &connections_state.connected_to_input {
        Some(current) => *current != audio_source_port,
        None => true,
      };

      to_be_added = destination_devices_ports
        .iter()
        .filter(|i| !connections_state.connected_to_output.contains(*i))
        .cloned()
        .collect();

      to_be_removed = connections_state
        .connected_to_output
        .iter()
        .filter(|i| !destination_devices_ports.contains(i))
        .cloned()
        .collect();
    }

    if needs_input_change {
      self.async_client.as_client().disconnect(&client_in_port)?;
      self
        .async_client
        .as_client()
        .connect_ports_by_name(&audio_source_port, &self.ports_names.input)?;
    }

    for port in to_be_added {
      self
        .async_client
        .as_client()
        .connect_ports_by_name(&self.ports_names.output, &port)?;
    }

    for port in to_be_removed {
      self
        .async_client
        .as_client()
        .disconnect_ports_by_name(&self.ports_names.output, &port)?;
    }

    Ok(())
  }
}
