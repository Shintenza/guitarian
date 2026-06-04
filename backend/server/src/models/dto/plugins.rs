use serde::{Deserialize, Serialize};
use shared::data::{ChainItem, PluginMetadata};

#[derive(Serialize, Deserialize)]
pub struct ListPluginsResponse {
  pub plugins: Vec<PluginMetadata>
}

#[derive(Serialize, Deserialize)]
pub struct AddPluginRequest {
  pub plugin_uri: String,
  pub position: u32,
}

#[derive(Serialize, Deserialize)]
pub struct AddPluginResponse {
  pub plugin: ChainItem
}
