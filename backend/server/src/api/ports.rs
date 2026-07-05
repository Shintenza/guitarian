use axum::{
  Router,
  routing::{get, post},
};

use crate::{
  context::AppContext,
  core::ports::{connect_ports, get_available_devices, get_current_conenctions},
};

pub fn router() -> Router<AppContext> {
  Router::new()
    .route("/", get(get_available_devices))
    .route("/state", get(get_current_conenctions))
    .route("/connect", post(connect_ports))
}
