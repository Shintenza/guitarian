use axum::{
  Json,
  extract::{Path, State},
  http::StatusCode,
  response::IntoResponse,
};
use sea_orm::{ActiveModelTrait, DbErr, EntityTrait, QuerySelect, Set};
use shared::{data::PresetItem, utils::plugin::chain_item_to_preset_item};

use crate::{
  context::AppContext,
  engine_client::{
    commands::{GetCurrentState, LoadPreset},
    engine_clinet::EngineClient,
  },
  models::{
    dto::presets::{
      ListPresetsResponse, LoadPresetResponse, PresetListItem, SaveCurrentPreset,
      SavePresetResponse, UpdatePresetRequest,
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

  let loaded_preset = ctx
    .engine_client
    .send_request(LoadPreset { id, preset })
    .await;

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

async fn fetch_preset_data(engine_client: &EngineClient) -> Result<serde_json::Value, StatusCode> {
  let current_chain = engine_client
    .send_request(GetCurrentState {})
    .await
    .map_err(|e| e.into_response().status())?;

  let preset: Vec<PresetItem> = current_chain
    .into_iter()
    .map(chain_item_to_preset_item)
    .collect();

  let serialized = serde_json::to_value(&preset).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
  Ok(serialized)
}

pub async fn handle_save_current_preset(
  State(ctx): State<AppContext>,
  Json(payload): Json<SaveCurrentPreset>,
) -> Result<Json<SavePresetResponse>, StatusCode> {
  let serialized_preset = fetch_preset_data(&ctx.engine_client).await?;

  let new_preset = preset::ActiveModel {
    name: Set(payload.preset_name),
    data: Set(serialized_preset),
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

pub async fn update_preset(
  State(ctx): State<AppContext>,
  Path(id): Path<u32>,
  Json(payload): Json<UpdatePresetRequest>,
) -> Result<StatusCode, StatusCode> {
  let mut preset_update = preset::ActiveModel {
    id: Set(id),
    ..Default::default()
  };

  if let Some(new_name) = payload.preset_name {
    preset_update.name = Set(new_name)
  }

  if payload.update_preset_chain {
    let serialized_preset = fetch_preset_data(&ctx.engine_client).await?;
    preset_update.data = Set(serialized_preset);
  }

  preset_update
    .update(&ctx.db)
    .await
    .map_err(|err| match err {
      DbErr::RecordNotFound(_) => StatusCode::NOT_FOUND,
      _ => StatusCode::INTERNAL_SERVER_ERROR,
    })?;

  Ok(StatusCode::OK)
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
