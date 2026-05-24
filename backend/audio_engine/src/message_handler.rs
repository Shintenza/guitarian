use bincode::{config, decode_from_slice, encode_to_vec};
use shared::{commands::{RequestCommand, RequestCommandResponse}, utils::get_rep_socket_address};
use zeromq::{RepSocket, Socket, SocketRecv, SocketSend};

use crate::plugin_manager::manager::PluginManager;

pub struct MessageHandler {
  plugin_manager: PluginManager,
  endpoint: String,
}

impl MessageHandler {
  pub fn new(plugin_manager: PluginManager) -> Self {
    let endpoint = get_rep_socket_address();

    Self {
      plugin_manager,
      endpoint,
    }
  }

  pub async fn listen(&self) {
    let mut socket = RepSocket::new();
    let config = config::standard();

    socket
      .bind(&self.endpoint)
      .await
      .expect("failed to bind socket");

    loop {
      let mut msg = socket.recv().await.unwrap();
      
      let payload = msg.get(0).unwrap();
      let (decoded, _size): (RequestCommand, usize) = decode_from_slice(payload, config).unwrap();

      match decoded {
        RequestCommand::GetAvailablePlugins => {
          println!("RECEIVED GET AVAILABLE PLUGINS!!!");
          let plugins_vec = self.plugin_manager.get_plugins();
          let data = RequestCommandResponse::AvailablePlugins(plugins_vec);
          let encoded = encode_to_vec(data, config).unwrap();
          socket.send(encoded.into()).await.ok();
        }
      }

    }
  }
}
