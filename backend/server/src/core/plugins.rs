use axum::{Json, extract::State, http::StatusCode};
use shared::commands::{GetAvailablePlugins};

use crate::{context::AppContext, models::dto::plugins::ListPluginsResponse};

pub async fn list_plugins(
  State(ctx): State<AppContext>,
) -> Result<Json<ListPluginsResponse>, StatusCode> {
  match ctx
    .engine_client
    .send_request_command(GetAvailablePlugins)
    .await
  {
    Ok(plugins) => {
      let _plugins_len = plugins.len();
      let plugins_response = ListPluginsResponse { plugins };
      Ok(Json(plugins_response))
    }
    Err(_e) => Err(StatusCode::INTERNAL_SERVER_ERROR),
  }
}
