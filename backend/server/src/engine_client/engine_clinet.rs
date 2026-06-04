use std::sync::Arc;

use bincode::{config, decode_from_slice, encode_to_vec};
use shared::{
  commands::{ RequestCommand, RequestCommandError, RequestCommandResponse},
  data::{ChainItem, PluginMetadata},
  utils::{get_sockets_endpoints, prepare_connect_endpoint},
};
use tokio::sync::Mutex;
use zeromq::{PushSocket, ReqSocket, Socket, SocketRecv, SocketSend};

use crate::engine_client::engine_subscriber::EngineSubscriber;

#[derive(Clone)]
pub struct EngineClient {
  req_socket: Arc<Mutex<ReqSocket>>,
  push_socket: Arc<Mutex<PushSocket>>,
}

impl EngineClient {
  pub fn new() -> Self {
    let req_socket = ReqSocket::new();
    let push_socket = PushSocket::new();

    Self {
      req_socket: Arc::new(Mutex::new(req_socket)),
      push_socket: Arc::new(Mutex::new(push_socket)),
    }
  }

  pub async fn connect(&mut self) {
    let (rep_endpoint, pull_endpoint, _) = get_sockets_endpoints();
    let mut req_socket = self.req_socket.lock().await;
    let mut push_socket = self.push_socket.lock().await;

    prepare_connect_endpoint(&rep_endpoint);
    req_socket
      .connect(&rep_endpoint)
      .await
      .expect("failed to connect with the rep socket");

    prepare_connect_endpoint(&pull_endpoint);
    push_socket
      .connect(&pull_endpoint)
      .await
      .expect("failed to connect with the pull socket");
  }

  pub fn get_engine_subbscriber() -> EngineSubscriber {
    let (_, _, pub_endpoint) = get_sockets_endpoints();
    let subscriber = EngineSubscriber::new(&pub_endpoint);

    subscriber
  }
  async fn send_raw(
    &self,
    command: RequestCommand,
  ) -> Result<RequestCommandResponse, RequestCommandError> {
    let config = config::standard();
    let mut socket = self.req_socket.lock().await;

    let req_bytes =
      encode_to_vec(command, config).map_err(|_| RequestCommandError::DataFormatError)?;

    socket
      .send(req_bytes.into())
      .await
      .map_err(|_| RequestCommandError::ConnectionError)?;

    let received_message = socket
      .recv()
      .await
      .map_err(|_| RequestCommandError::ConnectionError)?;
    let response_bytes = received_message
      .get(0)
      .ok_or(RequestCommandError::DataFormatError)?;

    let (decoded_response, _) = decode_from_slice(response_bytes, config)
      .map_err(|_| RequestCommandError::DataFormatError)?;

    Ok(decoded_response)
  }

  pub async fn get_available_plugins(&self) -> Result<Vec<PluginMetadata>, RequestCommandError> {
    let response = self.send_raw(RequestCommand::GetAvailablePlugins).await?;
    let RequestCommandResponse::AvailablePlugins(data) = response else {
      return Err(RequestCommandError::DataFormatError);
    };

    Ok(data)
  }

  pub async fn load_plugin(
    &self,
    uri: String,
    position: usize,
  ) -> Result<ChainItem, RequestCommandError> {
    let response = self
      .send_raw(RequestCommand::LoadPlugin(uri, position))
      .await?;

    let RequestCommandResponse::LoadedPlugin(data) = response else {
      return Err(RequestCommandError::DataFormatError);
    };

    Ok(data)
  }
}
