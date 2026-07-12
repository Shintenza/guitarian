use std::sync::{Arc, atomic::Ordering};

use livi::{EmptyPortConnections, Instance, PortCounts, PortIndex, event::LV2AtomSequence};

use crate::plugin_manager::types::PortConfig;

pub trait PluginInstance: Send + 'static {
  fn process(
    &mut self,
    in_l: &[f32],
    in_r: &[f32],
    out_l: &mut [f32],
    out_r: &mut [f32],
    n_frames: usize,
  );
  fn set_port_values_source(&mut self, port_values: Arc<Vec<PortConfig>>);
}

pub struct AtomSequencePorts {
  pub seq_in: LV2AtomSequence,
  pub seq_out: LV2AtomSequence,
}

pub struct LV2PluginInstance {
  instance: Instance,
  port_counts: PortCounts,
  atom_seq_ports: AtomSequencePorts,
  port_values: Option<Arc<Vec<PortConfig>>>,
}

impl PluginInstance for LV2PluginInstance {
  fn process(
    &mut self,
    in_l: &[f32],
    in_r: &[f32],
    out_l: &mut [f32],
    out_r: &mut [f32],
    n_frames: usize,
  ) {
    let inputs = [in_l, in_r];
    let input_iter = inputs.into_iter().take(self.port_counts.audio_inputs);

    let outputs = [&mut *out_l, &mut *out_r];
    let output_iter = outputs.into_iter().take(self.port_counts.audio_outputs);

    let atom_in_iter =
      std::iter::once(&self.atom_seq_ports.seq_in).take(self.port_counts.atom_sequence_inputs);

    let atom_out_iter = std::iter::once(&mut self.atom_seq_ports.seq_out)
      .take(self.port_counts.atom_sequence_outputs);

    let ports = EmptyPortConnections::new()
      .with_audio_inputs(input_iter)
      .with_audio_outputs(output_iter)
      .with_atom_sequence_inputs(atom_in_iter)
      .with_atom_sequence_outputs(atom_out_iter);

    if let Some(ports) = &self.port_values {
      for port in ports.iter() {
        self
          .instance
          .set_control_input(PortIndex(port.id), port.value.load(Ordering::Relaxed));
      }
    }

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
  pub fn new(
    instance: Instance,
    port_counts: PortCounts,
    atom_seq_ports: AtomSequencePorts,
  ) -> Self {
    Self {
      instance,
      port_counts,
      atom_seq_ports,
      port_values: None,
    }
  }
}
