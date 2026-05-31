use bincode::{Decode, Encode};
use serde::{Deserialize, Serialize};

#[derive(Decode, Encode, Serialize, Deserialize)]
pub struct ControlMetadata {
  pub id: u16,
  pub name: String,
  pub default_value: f32,
  pub min_value: f32,
  pub max_value: f32,
}

#[derive(Decode, Encode, Serialize, Deserialize)]
pub struct PluginMetadata {
  pub name: String,
  pub uri: String,
  pub class: String,
  pub controls_metadata: Vec<ControlMetadata>,
}

#[derive(Decode, Encode)]
pub struct ControlState {
  pub id: u16,
  pub value: f32
}

#[derive(Decode, Encode)]
pub struct ChainItem {
  pub id: u16,
  pub metadata: PluginMetadata,
  pub controls_state: Vec<ControlState> 
}
