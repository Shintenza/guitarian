use axum::{Json, extract::State, http::StatusCode};
use shared::data::{AudioConnections, AvailableAudioDevices};

use crate::{context::AppContext, models::dto::ports::ConnectPortsRequest};

pub async fn get_available_devices(
  State(ctx): State<AppContext>,
) -> Result<Json<AvailableAudioDevices>, StatusCode> {
  let Some(devices) = ctx.engine_client.get_audio_deivces().await.ok() else {
    return Err(StatusCode::INTERNAL_SERVER_ERROR);
  };

  Ok(Json(devices))
}

pub async fn get_current_conenctions(
  State(ctx): State<AppContext>,
) -> Result<Json<AudioConnections>, StatusCode> {
  let Some(connections) = ctx.engine_client.get_current_connections_state().await.ok() else {
    return Err(StatusCode::INTERNAL_SERVER_ERROR);
  };

  Ok(Json(connections))
}

pub async fn connect_ports(
  State(ctx): State<AppContext>,
  Json(payload): Json<ConnectPortsRequest>,
) -> Result<StatusCode, StatusCode> {
  ctx
    .engine_client
    .connect_ports(payload.input_device_port, payload.output_devices)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

  Ok(StatusCode::NO_CONTENT)
}
