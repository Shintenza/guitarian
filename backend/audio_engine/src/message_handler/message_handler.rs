use bincode::{config, encode_to_vec};
use shared::{
  commands::{
    ParamChangedPayload, PushCommand, RequestCommand,
    RequestCommandResponse::{self, ConnectedPorts, CurrentConnectionsState},
    StateChangeEvent,
  },
  data::{AudioConnections, AvailableAudioDevices},
  utils::socket::{get_sockets_endpoints, prepare_bind_endpoint},
};
use tokio::{
  sync::mpsc::{self, Sender},
  task,
};
use tokio_util::sync::CancellationToken;
use zeromq::{PubSocket, PullSocket, RepSocket, Socket, SocketRecv, SocketSend};

use crate::{
  decode_msg,
  jack_client::client::AudioEngine,
  message_handler::message_handler_controller::MessageHandlerController,
  plugin_manager::manager::PluginManager,
  utils::ports::{PortType, extract_unique_ports},
};

pub struct MessageHandler {
  cancel_token: CancellationToken,
  audio_engine: AudioEngine,
  plugin_manager: PluginManager,
}

impl MessageHandler {
  pub fn new(audio_engine: AudioEngine, plugin_manager: PluginManager) -> Self {
    Self {
      cancel_token: CancellationToken::new(),
      audio_engine,
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
      RequestCommand::GetAvailablePlugins(query) => {
        let plugins_vec = self.plugin_manager.get_plugins(query);
        response = RequestCommandResponse::AvailablePlugins(plugins_vec);
        tx_pub.send(StateChangeEvent::PresetLoaded).await;
      }
      RequestCommand::LoadPreset(preset) => match self.plugin_manager.load_preset(preset) {
        Ok(chain_items) => response = RequestCommandResponse::CurrentState(chain_items),
        Err(_e) => response = RequestCommandResponse::Error("failed to load preset".to_string()),
      },
      RequestCommand::GetCurrentState => {
        let current_state = self.plugin_manager.get_current_chain_state();
        response = RequestCommandResponse::CurrentState(current_state);
      }
      RequestCommand::UnloadPlugin(id) => match self.plugin_manager.unload_plugin(id) {
        Ok(_) => response = RequestCommandResponse::UnloadPlugin,
        Err(_e) => response = RequestCommandResponse::Error("failed to unload plugin".to_string()),
      },
      RequestCommand::ChangePluginPosition(plugin_id, new_position) => {
        self
          .plugin_manager
          .change_plugin_position(plugin_id, new_position);
        response = RequestCommandResponse::ChangePluginPosition;
      }
      RequestCommand::RemoveAll => {
        self.plugin_manager.clear();
        response = RequestCommandResponse::RemoveAll
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
      RequestCommand::GetAvailableAudioDevices => {
        /*this is a perspective of JACK, meaning physical inputs are **outputting** signal that can be
         * consumed by output devices that have audio **input** ports
         */
        let (inputs, outputs) = self.audio_engine.get_audio_devices();
        response = RequestCommandResponse::AvaialbleAudioDevices(AvailableAudioDevices {
          input_ports: outputs,
          output_devices: inputs,
        })
      }
      RequestCommand::GetCurrentConnectionsState => {
        let state = self
          .audio_engine
          .get_current_connections_state()
          .unwrap_or_default();
        let device_oriented_state = AudioConnections {
          input: state.connected_to_input,
          outputs: extract_unique_ports(
            state
              .connected_to_output
              .iter()
              .cloned()
              .collect::<Vec<_>>(),
            PortType::Input,
          ),
        };
        response = CurrentConnectionsState(device_oriented_state)
      }
      RequestCommand::ConnectPorts(audio_device_input, audio_device_outputs) => {
        for audio_device_output in audio_device_outputs {
          self
            .audio_engine
            .connect_devices(audio_device_output, audio_device_input.clone());
        }
        response = ConnectedPorts
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
