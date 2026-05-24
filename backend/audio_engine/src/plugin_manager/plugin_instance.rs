use std::sync::Arc;

use livi::{EmptyPortConnections, Instance, event::LV2AtomSequence};

use crate::plugin_manager::audio_plugins::PortConfig;

pub trait PluginInstance: Send + 'static {
  fn process(&mut self, input_port: &[f32], output_port: &mut [f32], n_frames: usize);
  fn set_port_values_source(&mut self, port_values: Arc<Vec<PortConfig>>);
}

pub struct AtomSequencePorts {
  pub seq_in: LV2AtomSequence,
  pub seq_out: LV2AtomSequence,
}

pub struct LV2PluginInstance {
  instance: Instance,
  atom_seq_ports: AtomSequencePorts,
  port_values: Option<Arc<Vec<PortConfig>>>
}

impl PluginInstance for LV2PluginInstance {
  fn process(&mut self, input_port: &[f32], output_port: &mut [f32], n_frames: usize) {
    let ports = EmptyPortConnections::new()
      .with_audio_inputs(std::iter::once(input_port))
      .with_audio_outputs(std::iter::once(&mut *output_port))
      .with_atom_sequence_inputs(std::iter::once(&self.atom_seq_ports.seq_in))
      .with_atom_sequence_outputs(std::iter::once(&mut self.atom_seq_ports.seq_out));

    unsafe {
      self
        .instance
        .run(n_frames, ports)
        .unwrap_or_else(|e| log::error!("plugin run error {}", e))
    }
  }
  fn set_port_values_source(&mut self, port_values: Arc<Vec<PortConfig>>) {
    self.port_values = Some(port_values);
  }
}

impl LV2PluginInstance {
  pub fn new(instance: Instance, atom_seq_ports: AtomSequencePorts) -> Self {
    Self {
      instance,
      atom_seq_ports,
      port_values: None,
    }
  }
}
