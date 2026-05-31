use std::sync::Arc;

use bincode::{config, decode_from_slice, encode_to_vec};
use shared::{
  commands::{CommandWithResponse, RequestCommandError, RequestCommandResponse},
  utils::get_sockets_endpoints,
};
use tokio::sync::Mutex;
use zeromq::{ReqSocket, Socket, SocketRecv, SocketSend};

#[derive(Clone)]
pub struct EngineClient {
  req_socket: Arc<Mutex<ReqSocket>>,
}

impl EngineClient {
  pub fn new() -> Self {
    let socket = ReqSocket::new();

    Self {
      req_socket: Arc::new(Mutex::new(socket)),
    }
  }

  pub async fn connect(&mut self) {
    let (rep_endpoint, _pull_endpoint) = get_sockets_endpoints();
    let mut socket = self.req_socket.lock().await;

    socket
      .connect(&rep_endpoint)
      .await
      .expect("failed to connect with the rep socket");
  }

  pub async fn send_request_command<C: CommandWithResponse>(
    &self,
    command: C,
  ) -> Result<C::Response, RequestCommandError> {
    let config = config::standard();
    let mut socket = self.req_socket.lock().await;

    let req_command = command.into_request();
    let req_bytes =
      encode_to_vec(req_command, config).map_err(|_| RequestCommandError::DataFormatError)?;

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

    let (decoded_response, _len): (RequestCommandResponse, usize) =
      decode_from_slice(response_bytes, config)
        .map_err(|_| RequestCommandError::DataFormatError)?;

    C::extract_response(decoded_response)
  }
}
