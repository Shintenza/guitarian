use bincode::{Decode, Encode};

#[derive(Decode, Encode)]
pub struct ControlMetadata {
  pub id: u16,
  pub name: String,
  pub default_value: f32,
  pub min_value: f32,
  pub max_value: f32,
}

#[derive(Decode, Encode)]
pub struct PluginMetadata {
  pub name: String,
  pub uri: String,
  pub class: String,
  pub controls_metadata: Vec<ControlMetadata>,
}
