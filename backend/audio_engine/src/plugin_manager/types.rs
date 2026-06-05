use std::sync::Arc;

use atomic_float::AtomicF32;
use shared::data::ControlState;

use crate::plugin_manager::plugin_instance::PluginInstance;

pub struct PortConfig {
  pub id: usize,
  pub value: AtomicF32,
}

#[derive(Clone)]
pub struct InstanceConfig {
  pub id: u32,
  pub plugin_uri: String,
  pub state: Arc<Vec<PortConfig>>,
}

pub struct InitializedPlugin {
  pub plugin_uri: String,
  pub instance: Box<dyn PluginInstance>,
  pub state: Vec<ControlState>
}

pub struct PluginInstanceWithId {
  pub id: u32,
  pub instance: Box<dyn PluginInstance>,
}

pub enum AudioCommand {
  AddPlugin(usize, PluginInstanceWithId),
  LoadPreset(Vec<PluginInstanceWithId>),
  RemovePlugin(u32),
}

pub enum PluginActionError {
  NotFound,
  InstantionFailed,
  QueueError,
}
