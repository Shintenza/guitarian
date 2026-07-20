use axum::Router;

use crate::context::AppContext;

mod chain;
mod config;
mod plugins;
mod ports;
mod presets;

pub fn router() -> Router<AppContext> {
  Router::new()
    .nest("/plugins", plugins::router())
    .nest("/presets", presets::router())
    .nest("/chain", chain::router())
    .nest("/ports", ports::router())
    .nest("/config", config::router())
}
