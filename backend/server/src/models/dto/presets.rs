use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};

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
