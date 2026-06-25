use crate::{
  context::AppContext,
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
) -> Result<Json<GetCurrentChainResponse>, StatusCode> {
  let chain = ctx
    .engine_client
    .get_current_state()
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
  Ok(Json(GetCurrentChainResponse { chain }))
}

pub async fn add_chain_item(
  State(ctx): State<AppContext>,
  Json(payload): Json<AddChainItem>,
) -> Result<Json<AddChainItemResponse>, StatusCode> {
  match ctx
    .engine_client
    .load_plugin(payload.plugin_uri, payload.position as usize)
    .await
  {
    Ok(plugin) => {
      let response = AddChainItemResponse { plugin };
      Ok(Json(response))
    }
    Err(_e) => Err(StatusCode::INTERNAL_SERVER_ERROR),
  }
}

pub async fn delete_chain_item(
  State(ctx): State<AppContext>,
  Path(id): Path<u32>,
) -> Result<StatusCode, StatusCode> {
  match ctx.engine_client.unload_plugin(id).await {
    Ok(_) => Ok(StatusCode::NO_CONTENT),
    Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
  }
}

pub async fn clear_chain(State(ctx): State<AppContext>) -> Result<StatusCode, StatusCode> {
  match ctx.engine_client.clear().await {
    Ok(_) => Ok(StatusCode::NO_CONTENT),
    Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
  }
}

pub async fn reorder_chain_item(
  State(ctx): State<AppContext>,
  Json(payload): Json<ReorderChainItemRequest>,
) -> Result<StatusCode, StatusCode> {
  match ctx
    .engine_client
    .change_plugin_position(payload.plugin_id, payload.new_position)
    .await
  {
    Ok(_) => Ok(StatusCode::NO_CONTENT),
    Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
  }
}
