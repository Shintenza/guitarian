use axum::{Router, routing::get};

use crate::{context::AppContext, core::plugins::list_plugins};

pub fn router() -> Router<AppContext> {
  Router::new().route("/", get(list_plugins))
}
