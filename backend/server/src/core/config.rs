use axum::{Json, extract::State, http::StatusCode};
use sea_orm::Iterable;
use shared::data::BufferSize;

use crate::{
  context::AppContext,
  engine_client::commands::{ChangeBufferSize, GetEngineConfig, RequestCommandError},
  models::dto::config::{CurrentEngineConfigResponse, SetBufferSizeRequest},
};

pub async fn get_engine_config(
  State(ctx): State<AppContext>,
) -> Result<Json<CurrentEngineConfigResponse>, RequestCommandError> {
  let config = ctx.engine_client.send_request(GetEngineConfig {}).await?;
  let response = CurrentEngineConfigResponse {
    sample_rate: config.sample_rate,
    buffer_size: config.buffer_size,
    available_buffer_sizes: BufferSize::iter().collect(),
  };

  Ok(Json(response))
}

pub async fn set_engine_buffer_size(
  State(ctx): State<AppContext>,
  Json(payload): Json<SetBufferSizeRequest>,
) -> Result<StatusCode, RequestCommandError> {
  ctx
    .engine_client
    .send_request(ChangeBufferSize {
      buffer_size: payload.buffer_size,
    })
    .await?;

  Ok(StatusCode::OK)
}
