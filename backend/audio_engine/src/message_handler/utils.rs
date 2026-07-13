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

pub async fn process_action<T, E, F, ErrMapper>(
  tx_pub: &Sender<StateChangeEvent>,
  result: Result<T, E>,
  map_response: F,
  map_error: ErrMapper,
  event_to_emit: Option<StateChangeEvent>,
) -> Result<RequestCommandResponse, RequestError>
where
  F: FnOnce(T) -> RequestCommandResponse,
  ErrMapper: FnOnce(E) -> RequestError,
{
  let data = result.map_err(map_error)?;

  if let Some(ev) = event_to_emit {
    tx_pub.send(ev).await.ok();
  }

  Ok(map_response(data))
}
