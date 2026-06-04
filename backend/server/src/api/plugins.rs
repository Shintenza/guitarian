use axum::{Router, routing::{get, post}};

use crate::{
  context::AppContext,
  core::plugins::{add_plugin, handle_ws_request, list_plugins},
};

pub fn router() -> Router<AppContext> {
  Router::new()
    .route("/", post(add_plugin))
    .route("/", get(list_plugins))
    .route("/ws", get(handle_ws_request))
}
