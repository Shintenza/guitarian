use bincode::{Decode, Encode};

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
  LoadPreset(Vec<PresetItem>),
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

#[derive(Encode, Decode)]
pub struct ParamChangedPayload {
  pub plugin_id: u32,
  pub port_id: u32,
  pub new_value: f32,
}

#[derive(Encode, Decode)]
pub enum StateChangeEvent {
  PluginLoaded,
  PresetLoaded,
  ParamChanged(ParamChangedPayload),
}
