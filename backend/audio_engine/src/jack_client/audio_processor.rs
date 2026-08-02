use jack::{AudioIn, AudioOut, Client, Control, Port, ProcessHandler, ProcessScope};
use ringbuf::{HeapCons, HeapProd, traits::Consumer, traits::Producer};

use crate::{
  plugin_manager::types::{
    AudioCommand::{self},
    PluginGarbage, PluginInstanceWithId,
  },
  utils::vector::move_item,
};

const INITIAL_ACTIVE_PLUGINS_CAPACITY: usize = 128;

pub struct AudioProcessor {
  audio_in: Port<AudioIn>,
  audio_out_l: Port<AudioOut>,
  audio_out_r: Port<AudioOut>,
  active_plugins: Vec<PluginInstanceWithId>,
  audio_commands_consumer: HeapCons<AudioCommand>,
  garbage_producer: HeapProd<PluginGarbage>,
  scratch_buf_l: Vec<f32>,
  scratch_buf_r: Vec<f32>,
}

impl AudioProcessor {
  pub fn new(
    audio_in: Port<AudioIn>,
    audio_out_l: Port<AudioOut>,
    audio_out_r: Port<AudioOut>,
    audio_commands_consumer: HeapCons<AudioCommand>,
    garbage_producer: HeapProd<PluginGarbage>,
    buffer_size: usize,
  ) -> Self {
    let active_plugins: Vec<PluginInstanceWithId> =
      Vec::with_capacity(INITIAL_ACTIVE_PLUGINS_CAPACITY);

    Self {
      audio_in,
      audio_out_l,
      audio_out_r,
      active_plugins,
      audio_commands_consumer,
      garbage_producer,
      scratch_buf_l: vec![0.0; buffer_size],
      scratch_buf_r: vec![0.0; buffer_size],
    }
  }

  fn discard(&mut self, garbage: PluginGarbage) {
    if self.garbage_producer.try_push(garbage).is_err() {
      log::warn!("plugin garbage buffer full, freeing on the audio thread");
    }
  }

  fn handle_commands(&mut self) {
    while let Some(command) = self.audio_commands_consumer.try_pop() {
      match command {
        AudioCommand::LoadPreset(plugins) => {
          let previous = std::mem::replace(&mut self.active_plugins, plugins);
          self.discard(PluginGarbage::Many(previous));
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
            let removed = self.active_plugins.remove(indeks);
            self.discard(PluginGarbage::One(removed));
          }
        }
        AudioCommand::ChangePluginPosition(id, new_position) => {
          let _ = move_item(&mut self.active_plugins, new_position, |item| item.id == id);
        }
        AudioCommand::RemoveAll => {
          let previous = std::mem::replace(
            &mut self.active_plugins,
            Vec::with_capacity(INITIAL_ACTIVE_PLUGINS_CAPACITY),
          );
          self.discard(PluginGarbage::Many(previous));
        }
      }
    }
  }
}

impl ProcessHandler for AudioProcessor {
  fn process(&mut self, _: &Client, process_scope: &ProcessScope) -> Control {
    self.handle_commands();

    let in_buf = self.audio_in.as_slice(process_scope);
    let out_l = self.audio_out_l.as_mut_slice(process_scope);
    let out_r = self.audio_out_r.as_mut_slice(process_scope);
    let n_frames = in_buf.len();

    if self.active_plugins.is_empty() {
      out_l.clone_from_slice(in_buf);
      out_r.clone_from_slice(in_buf);
      return Control::Continue;
    }

    let scratch_l = &mut self.scratch_buf_l[..n_frames];
    let scratch_r = &mut self.scratch_buf_r[..n_frames];

    out_l.clone_from_slice(in_buf);
    out_r.clone_from_slice(in_buf);

    let mut write_to_scratch = true;

    for active_plugin in &mut self.active_plugins {
      if write_to_scratch {
        active_plugin
          .instance
          .process(&*out_l, &*out_r, scratch_l, scratch_r, n_frames);
      } else {
        active_plugin
          .instance
          .process(&*scratch_l, &*scratch_r, out_l, out_r, n_frames);
      }

      write_to_scratch = !write_to_scratch;
    }

    if !write_to_scratch {
      out_l.clone_from_slice(scratch_l);
      out_r.clone_from_slice(scratch_r);
    }

    Control::Continue
  }
}
