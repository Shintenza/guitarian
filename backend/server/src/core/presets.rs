use axum::{
  Json,
  extract::{Path, State},
  http::StatusCode,
};
use sea_orm::{ActiveModelTrait, EntityTrait, QuerySelect, Set};
use shared::{data::PresetItem, utils::plugin::chain_item_to_preset_item};

use crate::{
  context::AppContext,
  models::{
    dto::presets::{ListPresetsResponse, LoadPresetResponse, PresetListItem, SaveCurrentPreset},
    entities::preset,
  },
};

pub async fn list_presets(
  State(ctx): State<AppContext>,
) -> Result<Json<ListPresetsResponse>, StatusCode> {
  let presets: Vec<PresetListItem> = preset::Entity::find()
    .select_only()
    .column(preset::Column::Id)
    .column(preset::Column::Name)
    .into_model::<PresetListItem>()
    .all(&ctx.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

  Ok(Json(ListPresetsResponse { presets }))
}

pub async fn load_preset(
  State(ctx): State<AppContext>,
  Path(id): Path<u32>,
) -> Result<Json<LoadPresetResponse>, StatusCode> {
  let db_preset = preset::Entity::find_by_id(id)
    .one(&ctx.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    .ok_or(StatusCode::NOT_FOUND)?;

  let preset: Vec<PresetItem> =
    serde_json::from_value(db_preset.data).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

  let loaded_preset = ctx
    .engine_client
    .load_preset(preset)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

  let response = LoadPresetResponse {
    id,
    name: db_preset.name,
    chain: loaded_preset,
  };

  Ok(Json(response))
}

pub async fn handle_save_current_preset(
  State(ctx): State<AppContext>,
  Json(payload): Json<SaveCurrentPreset>,
) -> Result<StatusCode, StatusCode> {
  let current_chain = ctx
    .engine_client
    .get_current_state()
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

  let preset: Vec<PresetItem> = current_chain
    .into_iter()
    .map(|item| chain_item_to_preset_item(item))
    .collect();

  let new_preset = preset::ActiveModel {
    name: Set(payload.preset_name),
    data: Set(serde_json::to_value(&preset).unwrap()),
    ..Default::default()
  };

  new_preset
    .insert(&ctx.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

  Ok(StatusCode::OK)
}
