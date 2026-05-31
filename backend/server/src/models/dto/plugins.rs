use serde::{Deserialize, Serialize};
use shared::data::PluginMetadata;

#[derive(Serialize, Deserialize)]
pub struct ListPluginsResponse {
  pub plugins: Vec<PluginMetadata>
}
