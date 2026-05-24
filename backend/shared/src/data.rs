use bincode::{Decode, Encode};

#[derive(Decode, Encode)]
pub struct PluginMetadata {
  pub name: String,
  pub uri: String,
  pub class: String,
}
