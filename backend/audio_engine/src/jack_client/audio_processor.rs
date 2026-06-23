use jack::{AudioIn, AudioOut, Client, Control, Port, ProcessHandler, ProcessScope};
use ringbuf::{HeapCons, traits::Consumer};

use crate::plugin_manager::types::{
  AudioCommand::{self},
  PluginInstanceWithId,
};

const INITIAL_ACTIVE_PLUGINS_CAPACITY: usize = 128;

pub struct AudioProcessor {
  audio_in: Port<AudioIn>,
  audio_out: Port<AudioOut>,
  active_plugins: Vec<PluginInstanceWithId>,
  audio_commands_consumer: HeapCons<AudioCommand>,
}

impl AudioProcessor {
  pub fn new(
    audio_in: Port<AudioIn>,
    audio_out: Port<AudioOut>,
    audio_commands_consumer: HeapCons<AudioCommand>,
  ) -> Self {
    let active_plugins: Vec<PluginInstanceWithId> =
      Vec::with_capacity(INITIAL_ACTIVE_PLUGINS_CAPACITY);

    Self {
      audio_in,
      audio_out,
      active_plugins,
      audio_commands_consumer,
    }
  }

  fn handle_commands(&mut self) {
    while let Some(command) = self.audio_commands_consumer.try_pop() {
      match command {
        AudioCommand::LoadPreset(plugins) => {
          self.active_plugins = plugins;
        }
        AudioCommand::AddPlugin(position, plugin) => {
          log::info!("plugin loaded");
          self.active_plugins.insert(position, plugin);
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
        AudioCommand::RemoveAll => {
          self.active_plugins.clear();
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

    let n_frames = in_buf.len();

    if self.active_plugins.len() == 0 {
      out_buf.clone_from_slice(in_buf);
      return Control::Continue;
    }

    for active_plugin in &mut self.active_plugins {
      active_plugin.instance.process(in_buf, out_buf, n_frames);
    }

    Control::Continue
  }
}
