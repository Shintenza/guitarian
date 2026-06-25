use serde::{Deserialize, Serialize};
use shared::data::ChainItem;

#[derive(Serialize, Deserialize)]
pub struct AddChainItem {
  pub plugin_uri: String,
  pub position: u32,
}

#[derive(Serialize, Deserialize)]
pub struct AddChainItemResponse {
  pub plugin: ChainItem,
}

#[derive(Serialize, Deserialize)]
pub struct GetCurrentChainResponse {
  pub chain: Vec<ChainItem>,
}

#[derive(Serialize, Deserialize)]
pub struct ReorderChainItemRequest {
  pub plugin_id: u32,
  pub new_position: usize,
}
