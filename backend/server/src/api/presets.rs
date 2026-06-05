use axum::{
  Router,
  routing::{get, post},
};

use crate::{
  context::AppContext,
  core::presets::{handle_save_current_preset, list_presets, load_preset},
};

pub fn router() -> Router<AppContext> {
  Router::new()
    .route("/", post(handle_save_current_preset))
    .route("/", get(list_presets))
    .route("/preset/{id}/load", post(load_preset))
}
