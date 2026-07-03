use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use shared::data::ChainItem;

#[derive(Deserialize)]
pub struct SaveCurrentPreset {
  pub preset_name: String,
}

#[derive(FromQueryResult, Serialize)]
pub struct PresetListItem {
  pub id: u32,
  pub name: String,
}

#[derive(Serialize)]
pub struct ListPresetsResponse {
  pub presets: Vec<PresetListItem>,
}

#[derive(Serialize)]
pub struct LoadPresetResponse {
  pub id: u32,
  pub name: String,
  pub chain: Vec<ChainItem>,
}

#[derive(Serialize)]
pub struct SavePresetResponse {
  pub name: String,
  pub id: u32,
}
