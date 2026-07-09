use axum::{
  Json,
  extract::{Path, State},
  http::StatusCode,
  response::IntoResponse,
};
use sea_orm::{ActiveModelTrait, EntityTrait, QuerySelect, Set};
use shared::{data::PresetItem, utils::plugin::chain_item_to_preset_item};

use crate::{
  context::AppContext,
  engine_client::commands::{GetCurrentState, LoadPreset},
  models::{
    dto::presets::{
      ListPresetsResponse, LoadPresetResponse, PresetListItem, SaveCurrentPreset,
      SavePresetResponse,
    },
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

  let loaded_preset = ctx.engine_client.send_request(LoadPreset { preset }).await;

  match loaded_preset {
    Ok(chain) => {
      let response = LoadPresetResponse {
        id,
        name: db_preset.name,
        chain,
      };

      Ok(Json(response))
    }
    Err(e) => Err(e.into_response().status()),
  }
}

pub async fn handle_save_current_preset(
  State(ctx): State<AppContext>,
  Json(payload): Json<SaveCurrentPreset>,
) -> Result<Json<SavePresetResponse>, StatusCode> {
  let response = ctx.engine_client.send_request(GetCurrentState {}).await;

  match response {
    Ok(current_chain) => {
      let preset: Vec<PresetItem> = current_chain
        .into_iter()
        .map(chain_item_to_preset_item)
        .collect();

      let new_preset = preset::ActiveModel {
        name: Set(payload.preset_name),
        data: Set(serde_json::to_value(&preset).unwrap()),
        ..Default::default()
      };

      let inserted_item = new_preset
        .insert(&ctx.db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

      let response = SavePresetResponse {
        name: inserted_item.name,
        id: inserted_item.id,
      };

      Ok(Json(response))
    }
    Err(e) => Err(e.into_response().status()),
  }
}

pub async fn remove_preset(
  State(ctx): State<AppContext>,
  Path(id): Path<u32>,
) -> Result<StatusCode, StatusCode> {
  preset::Entity::delete_by_id(id)
    .exec(&ctx.db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

  Ok(StatusCode::NO_CONTENT)
}
