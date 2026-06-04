use bincode::{config, encode_to_vec};
use shared::{
  commands::{
    ParamChangedPayload, PushCommand, RequestCommand, RequestCommandResponse, StateChangeEvent,
  },
  utils::{get_sockets_endpoints, prepare_bind_endpoint},
};
use tokio::{
  sync::mpsc::{self, Sender},
  task,
};
use tokio_util::sync::CancellationToken;
use zeromq::{PubSocket, PullSocket, RepSocket, Socket, SocketRecv, SocketSend};

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

  async fn handle_requests(
    &mut self,
    socket: &mut RepSocket,
    request: RequestCommand,
    tx_pub: &Sender<StateChangeEvent>,
  ) {
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
            tx_pub.send(StateChangeEvent::PluginLoaded).await;
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

  async fn handle_messages(&self, command: PushCommand, tx_pub: &Sender<StateChangeEvent>) {
    match command {
      PushCommand::SetParam(plugin_id, port_id, new_value) => {
        self
          .plugin_manager
          .set_plugin_port_value(plugin_id, port_id, new_value);
        let event_payload = ParamChangedPayload {
          plugin_id,
          port_id,
          new_value,
        };
        tx_pub
          .send(StateChangeEvent::ParamChanged(event_payload))
          .await;
      }
    }
  }

  async fn handle_notifications(socket: &mut PubSocket, event: StateChangeEvent) {
    let encoded = encode_to_vec(event, config::standard()).unwrap();
    socket.send(encoded.into()).await.ok();
  }

  pub async fn listen(&mut self) {
    let mut rep_socket = RepSocket::new();
    let mut pull_socket = PullSocket::new();
    let mut pub_socket = PubSocket::new();

    let (rep_endpoint, pull_endpoint, pub_endpoint) = get_sockets_endpoints();

    prepare_bind_endpoint(&rep_endpoint);
    rep_socket
      .bind(&rep_endpoint)
      .await
      .expect("failed to bind rep socket");

    prepare_bind_endpoint(&pull_endpoint);
    pull_socket
      .bind(&pull_endpoint)
      .await
      .expect("failed to bind pull socket");

    prepare_bind_endpoint(&pub_endpoint);
    pub_socket
      .bind(&pub_endpoint)
      .await
      .expect("failed to bind pub socket");

    let (tx_pub, mut rx_pub) = mpsc::channel::<StateChangeEvent>(100);

    task::spawn(async move {
      while let Some(event) = rx_pub.recv().await {
        MessageHandler::handle_notifications(&mut pub_socket, event).await;
      }
    });

    loop {
      tokio::select! {
        rep_msg = rep_socket.recv() => {
          let decoded: RequestCommand = decode_msg!(rep_msg);
          self.handle_requests(&mut rep_socket, decoded, &tx_pub).await;
        }
        pull_msg = pull_socket.recv()  => {
          let decoded: PushCommand = decode_msg!(pull_msg);
          self.handle_messages(decoded, &tx_pub).await;
        }
        _ = self.cancel_token.cancelled() => {
          break;
        }
      }
    }
  }
}
