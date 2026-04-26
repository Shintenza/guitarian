use jack::{AudioIn, AudioOut, Client, Control, Port, ProcessHandler, ProcessScope};
use livi::{EmptyPortConnections, PortIndex};
use ringbuf::{HeapCons, traits::Consumer};

use crate::jack_client::{
  audio_plugins::{AudioCommand, AudioPlugin},
  plugin_manager::AtomSequencePorts,
};

const INITIAL_ACTIVE_PLUGINS_CAPACITY: usize = 128;

pub struct AudioProcessor {
  audio_in: Port<AudioIn>,
  audio_out: Port<AudioOut>,
  atom_seq_ports: AtomSequencePorts,
  active_plugins: Vec<AudioPlugin>,
  audio_commands_consumer: HeapCons<AudioCommand>,
}

fn sync_plugin_instance_settings(plugin: &mut AudioPlugin) {
  for port_config in plugin.state.iter() {
    plugin
      .instance
      .set_control_input(port_config.index, port_config.value);
  }
}

impl AudioProcessor {
  pub fn new(
    audio_in: Port<AudioIn>,
    audio_out: Port<AudioOut>,
    atom_seq_ports: AtomSequencePorts,
    audio_commands_consumer: HeapCons<AudioCommand>,
  ) -> Self {
    let active_plugins: Vec<AudioPlugin> = Vec::with_capacity(INITIAL_ACTIVE_PLUGINS_CAPACITY);

    Self {
      audio_in,
      audio_out,
      atom_seq_ports,
      active_plugins,
      audio_commands_consumer,
    }
  }

  fn handle_commands(&mut self) {
    while let Some(command) = self.audio_commands_consumer.try_pop() {
      match command {
        AudioCommand::LoadPlugin(plugin) => {
          log::info!("plugin loaded");
          self.active_plugins.push(plugin);
        }
        AudioCommand::RemovePlugin(id) => {
          if let Some(indeks) = self
            .active_plugins
            .iter()
            .position(|plugin| plugin.id == id)
          {
            self.active_plugins.remove(indeks);
          }
        }
      }
    }
  }
}

impl ProcessHandler for AudioProcessor {
  fn process(&mut self, _: &Client, process_scope: &ProcessScope) -> Control {
    self.handle_commands();

    let in_buf = self.audio_in.as_slice(process_scope);
    let out_buf = self.audio_out.as_mut_slice(process_scope);

    let nframes = in_buf.len();

    if self.active_plugins.len() == 0 {
      out_buf.clone_from_slice(in_buf);
      return Control::Continue;
    }

    for active_plugin in &mut self.active_plugins {
      sync_plugin_instance_settings(active_plugin);

      let ports = EmptyPortConnections::new()
        .with_audio_inputs(std::iter::once(in_buf))
        .with_audio_outputs(std::iter::once(&mut *out_buf))
        .with_atom_sequence_inputs(std::iter::once(&self.atom_seq_ports.seq_in))
        .with_atom_sequence_outputs(std::iter::once(&mut self.atom_seq_ports.seq_out));

      active_plugin
        .instance
        .set_control_input(PortIndex(2), 100.0);

      unsafe {
        active_plugin
          .instance
          .run(nframes, ports)
          .unwrap_or_else(|e| log::error!("plugin run error {}", e))
      }
    }

    Control::Continue
  }
}
