use bincode::{Decode, Encode};

use crate::data::{ChainItem, PluginMetadata, PresetItem};

#[derive(Encode, Decode)]
pub enum RequestCommand {
  GetAvailablePlugins,
  GetCurrentState,
  LoadPlugin(String, usize),
  LoadPreset(Vec<PresetItem>)
}

#[derive(Encode, Decode)]
pub enum PushCommand {
  SetParam(u32, u32, f32)
}

#[derive(Encode, Decode)]
pub enum RequestCommandResponse {
  AvailablePlugins(Vec<PluginMetadata>),
  CurrentState(Vec<ChainItem>),
  LoadedPlugin(ChainItem),
  Error(String),
}

pub enum RequestCommandError {
  DataFormatError,
  ConnectionError
}

pub trait CommandWithResponse {
  type Response;
  fn into_request(self) -> RequestCommand;
  fn extract_response(response: RequestCommandResponse) -> Result<Self::Response, RequestCommandError>;
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
  ParamChanged(ParamChangedPayload)
}

