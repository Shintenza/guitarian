use axum::{
  http::StatusCode,
  response::{IntoResponse, Response},
};
use shared::{
  commands::{RequestCommand, RequestCommandResponse, RequestError},
  data::{
    AudioConnections, AvailableAudioDevices, BufferSize, ChainItem, EngineConfig, PluginMetadata,
    PluginQuery, PresetItem,
  },
};

use crate::define_command;

pub enum RequestCommandError {
  DataFormatError,
  ConnectionError,
  EngineError(RequestError),
}

impl IntoResponse for RequestCommandError {
  fn into_response(self) -> Response {
    let status = match self {
      RequestCommandError::ConnectionError => StatusCode::SERVICE_UNAVAILABLE,
      RequestCommandError::DataFormatError => StatusCode::INTERNAL_SERVER_ERROR,

      RequestCommandError::EngineError(engine_err) => match engine_err {
        RequestError::NotFound => StatusCode::NOT_FOUND,
        RequestError::InvalidArguments => StatusCode::BAD_REQUEST,
        RequestError::InternalError => StatusCode::INTERNAL_SERVER_ERROR,
      },
    };

    status.into_response()
  }
}

pub trait EngineCommand {
  type Response;
  fn to_command(self) -> RequestCommand;
  fn extract_response(res: RequestCommandResponse) -> Option<Self::Response>;
}

define_command!(
    GetAvailablePlugins { query: PluginQuery }
    => req: GetAvailablePlugins
    => res: AvailablePlugins(Vec<PluginMetadata>)
);

define_command!(
    LoadPlugin { uri: String, position: usize }
    => req: LoadPlugin
    => res: LoadedPlugin(ChainItem)
);

define_command!(
    RemoveAll {}
    => req: RemoveAll
    => res: RemoveAll
);

define_command!(
    UnloadPlugin { plugin_id: u32 }
    => req: UnloadPlugin
    => res: UnloadPlugin
);

define_command!(
    ChangePluginPosition { plugin_id: u32, new_position: usize }
    => req: ChangePluginPosition
    => res: ChangePluginPosition
);

define_command!(
    GetCurrentState {}
    => req: GetCurrentState
    => res: CurrentState(Vec<ChainItem>)
);

define_command!(
    LoadPreset { id: u32, preset: Vec<PresetItem> }
    => req: LoadPreset
    => res: CurrentState(Vec<ChainItem>)
);

define_command!(
    GetAvailableAudioDevices {}
    => req: GetAvailableAudioDevices
    => res: AvaialbleAudioDevices(AvailableAudioDevices)
);

define_command!(
    GetCurrentConnectionsState {}
    => req: GetCurrentConnectionsState
    => res: CurrentConnectionsState(AudioConnections)
);

define_command!(
    ConnectPorts { input_device_port: String, output_devices: Vec<String> }
    => req: ConnectPorts
    => res: ConnectedPorts
);

define_command!(
    GetEngineConfig {}
    => req: GetCurrentEngineConfig
    => res: CurrentEngineConfig(EngineConfig)
);

define_command!(
    ChangeBufferSize { buffer_size: BufferSize }
    => req: SetBufferSize
    => res: BufferSizeChanged
);
