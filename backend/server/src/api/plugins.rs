use axum::{
  Router,
  routing::{delete, get, post},
};

use crate::{
  context::AppContext,
  core::plugins::{add_plugin, get_current_chain, handle_ws_request, list_plugins, remove_plugins},
};

pub fn router() -> Router<AppContext> {
  Router::new()
    .route("/", post(add_plugin))
    .route("/", delete(remove_plugins))
    .route("/", get(list_plugins))
    .route("/chain", get(get_current_chain))
    .route("/ws", get(handle_ws_request))
}
