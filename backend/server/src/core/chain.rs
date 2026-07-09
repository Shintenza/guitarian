use crate::{
  context::AppContext,
  engine_client::commands::{
    ChangePluginPosition, GetCurrentState, LoadPlugin, RemoveAll, RequestCommandError, UnloadPlugin,
  },
  models::dto::chain::{
    AddChainItem, AddChainItemResponse, GetCurrentChainResponse, ReorderChainItemRequest,
  },
};
use axum::{
  Json,
  extract::{Path, State},
  http::StatusCode,
};

pub async fn get_current_chain(
  State(ctx): State<AppContext>,
) -> Result<Json<GetCurrentChainResponse>, RequestCommandError> {
  let chain = ctx.engine_client.send_request(GetCurrentState {}).await?;
  Ok(Json(GetCurrentChainResponse { chain }))
}

pub async fn add_chain_item(
  State(ctx): State<AppContext>,
  Json(payload): Json<AddChainItem>,
) -> Result<Json<AddChainItemResponse>, RequestCommandError> {
  let plugin = ctx
    .engine_client
    .send_request(LoadPlugin {
      uri: payload.plugin_uri,
      position: payload.position as usize,
    })
    .await?;

  let response = AddChainItemResponse { plugin };
  Ok(Json(response))
}

pub async fn delete_chain_item(
  State(ctx): State<AppContext>,
  Path(id): Path<u32>,
) -> Result<StatusCode, RequestCommandError> {
  ctx
    .engine_client
    .send_request(UnloadPlugin { plugin_id: id })
    .await?;
  Ok(StatusCode::NO_CONTENT)
}

pub async fn clear_chain(State(ctx): State<AppContext>) -> Result<StatusCode, RequestCommandError> {
  ctx.engine_client.send_request(RemoveAll {}).await?;
  Ok(StatusCode::NO_CONTENT)
}

pub async fn reorder_chain_item(
  State(ctx): State<AppContext>,
  Json(payload): Json<ReorderChainItemRequest>,
) -> Result<StatusCode, RequestCommandError> {
  ctx
    .engine_client
    .send_request(ChangePluginPosition {
      plugin_id: payload.plugin_id,
      new_position: payload.new_position,
    })
    .await?;

  Ok(StatusCode::NO_CONTENT)
}
