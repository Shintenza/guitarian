use axum::Router;

use crate::context::AppContext;

mod plugins;

pub fn router() -> Router<AppContext> {
  Router::new().nest("/plugins", plugins::router())
}
