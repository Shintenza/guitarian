use jack::{AudioIn, AudioOut, Client, Control, Port, ProcessHandler, ProcessScope};
use ringbuf::{HeapCons, traits::Consumer};

use crate::{
  plugin_manager::types::{
    AudioCommand::{self},
    PluginInstanceWithId,
  },
  utils::vector::move_item,
};

const INITIAL_ACTIVE_PLUGINS_CAPACITY: usize = 128;

pub struct AudioProcessor {
  audio_in: Port<AudioIn>,
  audio_out: Port<AudioOut>,
  active_plugins: Vec<PluginInstanceWithId>,
  audio_commands_consumer: HeapCons<AudioCommand>,
  scratch_buf: Vec<f32>,
}

impl AudioProcessor {
  pub fn new(
    audio_in: Port<AudioIn>,
    audio_out: Port<AudioOut>,
    audio_commands_consumer: HeapCons<AudioCommand>,
    buffer_size: usize,
  ) -> Self {
    let active_plugins: Vec<PluginInstanceWithId> =
      Vec::with_capacity(INITIAL_ACTIVE_PLUGINS_CAPACITY);

    Self {
      audio_in,
      audio_out,
      active_plugins,
      audio_commands_consumer,
      scratch_buf: vec![0.0; buffer_size],
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
        AudioCommand::ChangePluginPosition(id, new_position) => {
          let _ = move_item(&mut self.active_plugins, new_position, |item| item.id == id);
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

    if self.active_plugins.is_empty() {
      out_buf.clone_from_slice(in_buf);
      return Control::Continue;
    }

    let scratch = &mut self.scratch_buf[..n_frames];

    out_buf.clone_from_slice(in_buf);

    let mut write_to_scratch = true;

    for active_plugin in &mut self.active_plugins {
      if write_to_scratch {
        active_plugin.instance.process(&*out_buf, scratch, n_frames);
      } else {
        active_plugin.instance.process(&*scratch, out_buf, n_frames);
      }

      write_to_scratch = !write_to_scratch;
    }

    if !write_to_scratch {
      out_buf.clone_from_slice(scratch);
    }

    Control::Continue
  }
}
