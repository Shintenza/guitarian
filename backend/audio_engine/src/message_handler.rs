use std::env;

use zeromq::{RepSocket, Socket, SocketRecv};

use crate::plugin_manager::manager::PluginManager;

pub struct MessageHandler {
  plugin_manager: PluginManager,
  endpoint: String,
}

const DEFAULT_SOCKET_ADDRESS: &str = "127.0.0.1:6666";

impl MessageHandler {
  pub fn new(plugin_manager: PluginManager) -> Self {
    let address = env::var("SOCKET_ADDRESS").unwrap_or(DEFAULT_SOCKET_ADDRESS.to_string());
    let endpoint = format!("tcp://{address}");

    Self {
      plugin_manager,
      endpoint,
    }
  }

  pub async fn listen(&self) {
    let mut socket = RepSocket::new();

    socket
      .bind(&self.endpoint)
      .await
      .expect("failed to bind socket");

    loop {
      let mut msg = socket.recv().await.unwrap();
    }
  }
}
