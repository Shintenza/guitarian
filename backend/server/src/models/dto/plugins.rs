use serde::{Deserialize, Serialize};
use shared::data::{PluginClass, PluginMetadata};

#[derive(Serialize, Deserialize)]
pub struct ListPluginsResponse {
  pub plugins: Vec<PluginMetadata>,
}

#[derive(Deserialize, Debug)]
#[serde(tag = "action")]
pub enum WebSocketClientMessage {
  SetParam {
    plugin_id: u32,
    port_id: u32,
    value: f32,
  },
}

#[derive(Serialize)]
pub struct WebSocketNotificationMessage {
  pub message: String,
}

#[derive(Deserialize)]
pub struct ListPluginsQuery {
  pub name: Option<String>,
  pub class: Option<Vec<PluginClass>>,
  pub uri: Option<Vec<String>>,
}
