use axum::{
  Router,
  routing::{get, post},
};

use crate::{
  context::AppContext,
  core::config::{get_engine_config, set_engine_buffer_size},
};

pub fn router() -> Router<AppContext> {
  Router::new()
    .route("/", get(get_engine_config))
    .route("/", post(set_engine_buffer_size))
}
