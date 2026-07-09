use shared::commands::{RequestCommandResponse, RequestError, StateChangeEvent};

use tokio::sync::mpsc::Sender;

use crate::plugin_manager::types::ChainOperationError;

#[macro_export]
macro_rules! decode_msg {
  ($msg:expr) => {{
    let raw_msg = $msg.unwrap();
    let payload = raw_msg.get(0).unwrap();
    let (decoded, _size) =
      bincode::decode_from_slice(payload, bincode::config::standard()).unwrap();
    decoded
  }};
}

pub fn chain_error_to_request_error(plugin_error: ChainOperationError) -> RequestError {
  match plugin_error {
    ChainOperationError::NotFound => RequestError::NotFound,
    ChainOperationError::QueueError => RequestError::InternalError,
    ChainOperationError::InvalidArguments => RequestError::InvalidArguments,
    ChainOperationError::BufferError => RequestError::InternalError,
  }
}

pub async fn emit_and_respond(
  tx_pub: &Sender<StateChangeEvent>,
  event: StateChangeEvent,
  response: RequestCommandResponse,
) -> Result<RequestCommandResponse, RequestError> {
  tx_pub
    .send(event)
    .await
    .map(|_| response)
    .map_err(|_| RequestError::InternalError)
}
