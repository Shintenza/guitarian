use bincode::{Decode, Encode};
use serde::Serialize;

use crate::data::{
  AudioConnections, AvailableAudioDevices, ChainItem, PluginMetadata, PluginQuery, PresetItem,
};

#[derive(Encode, Decode)]
pub enum RequestError {
  NotFound,
  InvalidArguments,
  InternalError,
}

#[derive(Encode, Decode)]
pub enum RequestCommand {
  GetAvailableAudioDevices,
  GetCurrentConnectionsState,
  ConnectPorts(String, Vec<String>),
  GetAvailablePlugins(PluginQuery),
  GetCurrentState,
  LoadPlugin(String, usize),
  LoadPreset(u32, Vec<PresetItem>),
  ChangePluginPosition(u32, usize),
  UnloadPlugin(u32),
  RemoveAll,
}

#[derive(Encode, Decode)]
pub enum PushCommand {
  SetParam(u32, u32, f32),
}

#[derive(Encode, Decode)]
pub enum RequestCommandResponse {
  AvaialbleAudioDevices(AvailableAudioDevices),
  CurrentConnectionsState(AudioConnections),
  AvailablePlugins(Vec<PluginMetadata>),
  CurrentState(Vec<ChainItem>),
  LoadedPlugin(ChainItem),
  ChangePluginPosition,
  ConnectedPorts,
  UnloadPlugin,
  RemoveAll,
  Error(String),
}

#[derive(Encode, Decode, Serialize)]
#[serde(tag = "type", content = "payload")]
pub enum StateChangeEvent {
  Cleared,
  PluginLoaded {
    plugin_uri: String,
    position: usize,
  },
  PluginPositionChanged {
    plugin_id: u32,
    new_position: usize,
  },
  PluginUnloaded {
    plugin_id: u32,
  },
  PresetLoaded {
    preset_id: u32,
  },
  ConnectionsChanged,
  ParamChanged {
    plugin_id: u32,
    port_id: u32,
    new_value: f32,
  },
}
