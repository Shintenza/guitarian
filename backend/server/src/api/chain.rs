use axum::{
  Router,
  routing::{delete, get, post},
};

use crate::{
  context::AppContext,
  core::{
    chain::{
      add_chain_item, clear_chain, delete_chain_item, get_current_chain, reorder_chain_item,
    },
    chain_ws::handle_ws_request,
  },
};

pub fn router() -> Router<AppContext> {
  Router::new()
    .route("/", get(get_current_chain))
    .route("/", post(add_chain_item))
    .route("/", delete(clear_chain))
    .route("/reorder", post(reorder_chain_item))
    .route("/ws", get(handle_ws_request))
    .route("/item/{id}", delete(delete_chain_item))
}
