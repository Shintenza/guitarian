use std::collections::HashMap;
use std::sync::Arc;

use livi::event::LV2AtomSequence;
use livi::{Features, World};
use ringbuf::HeapProd;
use ringbuf::traits::Producer;

use crate::plugin_manager::audio_plugins::{
  AudioCommand, AudioPlugin, LoadPluginError, PluginMeta, PortConfig,
};
use crate::plugin_manager::utils::get_plugin_ports_state;

pub struct PluginManager {
  world: World,
  sample_rate: u32,
  producer: HeapProd<AudioCommand>,
  plugin_register: HashMap<u32, PluginMeta>,
  features: Arc<Features>,
  plugin_id: u32,
}

pub struct AtomSequencePorts {
  pub seq_in: LV2AtomSequence,
  pub seq_out: LV2AtomSequence,
}

impl PluginManager {
  pub fn new(sample_rate: u32, producer: HeapProd<AudioCommand>) -> Self {
    let world = livi::World::new();
    let features = world.build_features(livi::FeaturesBuilder::default());
    let plugin_id = 0;
    let plugin_register: HashMap<u32, PluginMeta> = HashMap::new();

    PluginManager {
      world,
      producer,
      sample_rate,
      features,
      plugin_id,
      plugin_register,
    }
  }

  pub fn create_atom_seq_ports(&self) -> AtomSequencePorts {
    let seq_in = LV2AtomSequence::new(&self.features, 1024);
    let seq_out = LV2AtomSequence::new(&self.features, 1024);

    return AtomSequencePorts { seq_in, seq_out };
  }

  pub fn load_plugin(&mut self, uri: &str) -> Result<(), LoadPluginError> {
    let plugin = match self.world.plugin_by_uri(uri) {
      Some(p) => p,
      None => return Err(LoadPluginError::NotFound),
    };

    let instance = unsafe {
      match plugin.instantiate(self.features.clone(), self.sample_rate as f64) {
        Ok(p) => p,
        Err(_e) => return Err(LoadPluginError::InstantionFailed),
      }
    };

    let state: Vec<PortConfig> = get_plugin_ports_state(&plugin);
    let state_arc = Arc::new(state);

    let id = self.plugin_id;
    let audio_plugin = AudioPlugin {
      id,
      instance,
      state: state_arc.clone(),
    };

    let plugin_meta = PluginMeta {
      name: plugin.name(),
      id,
      state: state_arc.clone(),
    };

    self.plugin_register.insert(id, plugin_meta);

    self.plugin_id += 1;

    let command = AudioCommand::LoadPlugin(audio_plugin);
    self.producer.try_push(command).ok();

    Ok(())
  }
}
