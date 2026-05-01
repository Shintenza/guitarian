use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct PluginMetadata {
  pub name: String,
  pub uri: String,
  pub class: String,
}
