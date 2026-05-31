use bincode::{config, encode_to_vec};
use shared::{
  commands::{RequestCommand, RequestCommandResponse},
  utils::get_sockets_endpoints,
};
use tokio_util::sync::CancellationToken;
use zeromq::{PullSocket, RepSocket, Socket, SocketRecv, SocketSend};

use crate::{
  decode_msg, message_handler::message_handler_controller::MessageHandlerController,
  plugin_manager::manager::PluginManager,
};

pub struct MessageHandler {
  cancel_token: CancellationToken,
  plugin_manager: PluginManager,
}

impl MessageHandler {
  pub fn new(plugin_manager: PluginManager) -> Self {
    Self {
      cancel_token: CancellationToken::new(),
      plugin_manager,
    }
  }

  pub fn get_controller(&mut self) -> MessageHandlerController {
    MessageHandlerController::new(self.cancel_token.clone())
  }

  async fn handle_requests(&mut self, socket: &mut RepSocket, request: RequestCommand) {
    let response: RequestCommandResponse;

    match request {
      RequestCommand::GetAvailablePlugins => {
        let plugins_vec = self.plugin_manager.get_plugins();
        response = RequestCommandResponse::AvailablePlugins(plugins_vec);
      }
      RequestCommand::GetCurrentState => {
        let current_state = self.plugin_manager.get_current_chain_state();
        response = RequestCommandResponse::CurrentState(current_state);
      }
      RequestCommand::LoadPlugin(plugin_uri, position) => {
        let load_result = self.plugin_manager.load_plugin(position, &plugin_uri);
        match load_result {
          Ok(chain_item) => {
            response = RequestCommandResponse::LoadedPlugin(chain_item);
          }
          Err(_e) => {
            response = RequestCommandResponse::Error("failed to load plugin".to_string());
          }
        }
      }
    }

    let encoded = encode_to_vec(response, config::standard()).unwrap();
    socket.send(encoded.into()).await.ok();
  }

  async fn handle_messages(&self, _socket: &mut PullSocket) {}

  pub async fn listen(&mut self) {
    let mut rep_socket = RepSocket::new();
    let mut pull_socket = PullSocket::new();

    let (rep_endpoint, pull_endpoint) = get_sockets_endpoints();
    rep_socket
      .bind(&rep_endpoint)
      .await
      .expect("failed to bind socket");

    pull_socket
      .bind(&pull_endpoint)
      .await
      .expect("failed to bind socket");

    loop {
      tokio::select! {
        rep_msg = rep_socket.recv() => {
          let decoded: RequestCommand = decode_msg!(rep_msg);
          self.handle_requests(&mut rep_socket, decoded).await;
        }
        _pull_msg = pull_socket.recv()  => {

        }
        _ = self.cancel_token.cancelled() => {
          break;
        }
      }
    }
  }
}
