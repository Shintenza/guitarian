use axum::Router;

use crate::context::AppContext;

mod plugins;
mod presets;

pub fn router() -> Router<AppContext> {
  Router::new()
    .nest("/plugins", plugins::router())
    .nest("/presets", presets::router())
}
