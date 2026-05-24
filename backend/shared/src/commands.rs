use bincode::{Decode, Encode};

use crate::data::PluginMetadata;

#[derive(Encode, Decode)]
pub enum RequestCommand {
  GetAvailablePlugins,
}

#[derive(Encode, Decode)]
pub enum RequestCommandResponse {
  AvailablePlugins(Vec<PluginMetadata>),
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

macro_rules! impl_command {
  ($cmd_name:ident, $req_variant:ident, $resp_variant:ident, $resp_type:ty) => {
    pub struct $cmd_name;
    impl CommandWithResponse for $cmd_name {
      type Response = $resp_type;

      fn into_request(self) -> RequestCommand {
        RequestCommand::$req_variant
      }

      fn extract_response(response: RequestCommandResponse) -> Result<Self::Response, RequestCommandError> {
        match response {
          RequestCommandResponse::$resp_variant(data) => Ok(data),
          RequestCommandResponse::Error(_err) => Err(RequestCommandError::ConnectionError),
          _ => Err(RequestCommandError::DataFormatError)
        }
      }
    }
  };
}

impl_command!(GetAvailablePlugins, GetAvailablePlugins, AvailablePlugins, Vec<PluginMetadata>);

