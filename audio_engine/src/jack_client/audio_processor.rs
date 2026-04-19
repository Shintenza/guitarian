use jack::{AudioIn, AudioOut, Client, Control, Port, ProcessHandler, ProcessScope};
use livi::EmptyPortConnections;
use livi::event::LV2AtomSequence;

use crate::jack_client::audio_plugins::AudioPlugin;

const INITIAL_ACTIVE_PLUGINS_CAPACITY: usize = 128;

pub struct AudioProcessor {
  audio_in: Port<AudioIn>,
  audio_out: Port<AudioOut>,
  seq_in: livi::event::LV2AtomSequence,
  seq_out: livi::event::LV2AtomSequence,
  active_plugins: Vec<AudioPlugin>,
}

impl AudioProcessor {
  pub fn new(
    audio_in: Port<AudioIn>,
    audio_out: Port<AudioOut>,
    seq_in: LV2AtomSequence,
    seq_out: LV2AtomSequence,
  ) -> Self {
    let active_plugins: Vec<AudioPlugin> = Vec::with_capacity(INITIAL_ACTIVE_PLUGINS_CAPACITY);

    Self {
      audio_in,
      audio_out,
      seq_in,
      seq_out,
      active_plugins,
    }
  }
}

impl ProcessHandler for AudioProcessor {
  fn process(&mut self, _: &Client, process_scope: &ProcessScope) -> Control {
    let in_buf = self.audio_in.as_slice(process_scope);
    let out_buf = self.audio_out.as_mut_slice(process_scope);

    let nframes = in_buf.len();

    if self.active_plugins.len() == 0 {
      out_buf.clone_from_slice(in_buf);
      return Control::Continue;
    }

    for active_plugin in &mut self.active_plugins {
      let ports = EmptyPortConnections::new()
        .with_audio_inputs(std::iter::once(in_buf))
        .with_audio_outputs(std::iter::once(&mut *out_buf))
        .with_atom_sequence_inputs(std::iter::once(&self.seq_in))
        .with_atom_sequence_outputs(std::iter::once(&mut self.seq_out));
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
