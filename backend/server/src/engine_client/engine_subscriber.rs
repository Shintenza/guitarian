use bincode::{
  config::{self},
  decode_from_slice,
};
use shared::{commands::StateChangeEvent, utils::prepare_connect_endpoint};
use zeromq::{Socket, SocketRecv, SubSocket};

pub struct EngineSubscriber {
  socket: SubSocket,
  endpoint: String
}

impl EngineSubscriber {
  pub fn new(endpoint: &str) -> Self {
    Self {
      endpoint: endpoint.to_string(),
      socket: SubSocket::new(),
    }
  }

  pub async fn subscribe(&mut self) {
    prepare_connect_endpoint(&self.endpoint);
    self.socket.connect(&self.endpoint).await.expect("faied to connect with the pub socket");
  }

  pub async fn recv(&mut self) -> Option<StateChangeEvent> {
    let zmq_message = self.socket.recv().await.ok()?;

    let frame_bytes = zmq_message.get(0)?;

    let (decoded_response, _len): (StateChangeEvent, usize) =
      decode_from_slice(frame_bytes, config::standard()).ok()?;

    Some(decoded_response)
  }
}
