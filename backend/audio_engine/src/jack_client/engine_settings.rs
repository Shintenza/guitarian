use std::fs;

use anyhow::Result;
use serde::{Deserialize, Serialize};
use shared::{data::BufferSize, utils::app_data::get_engine_settings_location};

use crate::jack_client::types::ConnectionsState;

#[derive(Serialize, Deserialize, Default)]
pub struct EngineSettings {
  pub buffer_size: BufferSize,
  pub connections_state: ConnectionsState,
}

impl EngineSettings {
  pub fn load() -> Self {
    let path = get_engine_settings_location();
    if let Ok(config_str) = fs::read_to_string(path) {
      serde_json::from_str(&config_str).unwrap_or_default()
    } else {
      Self::default()
    }
  }

  pub fn save(&self) -> Result<()> {
    let path = get_engine_settings_location();
    let config_str = serde_json::to_string_pretty(self)?;
    fs::write(path, config_str)?;
    Ok(())
  }

  pub fn modify_and_save<F>(&mut self, f: F) -> Result<()>
  where
    F: FnOnce(&mut Self),
  {
    f(self);
    self.save()
  }
}
