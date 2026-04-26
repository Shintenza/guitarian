use std::sync::Arc;

use livi::{Instance, PortIndex};

pub struct PortConfig {
  pub index: PortIndex,
  pub value: f32,
}

pub struct PluginMeta {
  pub id: u32,
  pub name: String,
  pub state: Arc<Vec<PortConfig>>,
}

pub struct AudioPlugin {
  pub id: u32,
  pub instance: Instance,
  pub state: Arc<Vec<PortConfig>>,
}

pub enum AudioCommand {
  LoadPlugin(AudioPlugin),
  RemovePlugin(u32),
}
