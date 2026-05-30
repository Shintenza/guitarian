use bincode::{config, encode_to_vec};
use shared::{
  commands::{RequestCommand, RequestCommandResponse},
  utils::get_sockets_endpoints,
};
use tokio_util::sync::CancellationToken;
use zeromq::{PullSocket, RepSocket, Socket, SocketRecv, SocketSend};

use crate::{decode_msg, plugin_manager::manager::PluginManager};

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

  pub fn shut_down(&mut self) {
    self.cancel_token.cancel();
  }

  async fn handle_requests(&self, socket: &mut RepSocket, request: RequestCommand) {
    match request {
      RequestCommand::GetAvailablePlugins => {
        let plugins_vec = self.plugin_manager.get_plugins();
        let data = RequestCommandResponse::AvailablePlugins(plugins_vec);
        let encoded = encode_to_vec(data, config::standard()).unwrap();
        socket.send(encoded.into()).await.ok();
      }
    }
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
          self.handle_requests(&mut rep_socket, decoded);
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
