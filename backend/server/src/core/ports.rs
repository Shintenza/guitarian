use axum::{Json, extract::State, http::StatusCode};
use shared::data::{AudioConnections, AvailableAudioDevices};

use crate::{
  context::AppContext,
  engine_client::commands::{
    ConnectPorts, GetAvailableAudioDevices, GetCurrentConnectionsState, RequestCommandError,
  },
  models::dto::ports::ConnectPortsRequest,
};

pub async fn get_available_devices(
  State(ctx): State<AppContext>,
) -> Result<Json<AvailableAudioDevices>, RequestCommandError> {
  let devices = ctx
    .engine_client
    .send_request(GetAvailableAudioDevices {})
    .await?;

  Ok(Json(devices))
}

pub async fn get_current_conenctions(
  State(ctx): State<AppContext>,
) -> Result<Json<AudioConnections>, RequestCommandError> {
  let connections = ctx
    .engine_client
    .send_request(GetCurrentConnectionsState {})
    .await?;

  Ok(Json(connections))
}

pub async fn connect_ports(
  State(ctx): State<AppContext>,
  Json(payload): Json<ConnectPortsRequest>,
) -> Result<StatusCode, RequestCommandError> {
  ctx
    .engine_client
    .send_request(ConnectPorts {
      input_device_port: payload.input_device_port,
      output_devices: payload.output_devices,
    })
    .await?;

  Ok(StatusCode::NO_CONTENT)
}
