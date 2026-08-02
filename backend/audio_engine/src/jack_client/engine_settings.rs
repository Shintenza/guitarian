use std::sync::Arc;
use std::time::Duration;

use anyhow::Result;
use arc_swap::ArcSwap;
use serde::{Deserialize, Serialize};
use shared::{data::BufferSize, utils::app_data::get_engine_settings_location};

use crate::jack_client::types::ConnectionsState;
use crate::utils::debounced_saver::{DebouncedSaver, read_json, write_atomic};

const SAVE_DEBOUNCE_MS: u64 = 300;

#[derive(Serialize, Deserialize, Default, Clone)]
pub struct EngineSettingsData {
  pub buffer_size: BufferSize,
  pub connections_state: ConnectionsState,
}

impl EngineSettingsData {
  pub fn load_from_disk() -> Self {
    read_json(&get_engine_settings_location()).unwrap_or_default()
  }

  pub fn save(&self) -> Result<()> {
    write_atomic(&get_engine_settings_location(), self)
  }
}

pub struct EngineSettings {
  state: Arc<ArcSwap<EngineSettingsData>>,
  saver: DebouncedSaver<EngineSettingsData>,
}

impl Clone for EngineSettings {
  fn clone(&self) -> Self {
    Self {
      state: self.state.clone(),
      saver: self.saver.clone(),
    }
  }
}

impl EngineSettings {
  pub fn new(initial: EngineSettingsData) -> Self {
    Self {
      state: Arc::new(ArcSwap::new(Arc::new(initial))),
      saver: DebouncedSaver::new(
        get_engine_settings_location(),
        Duration::from_millis(SAVE_DEBOUNCE_MS),
      ),
    }
  }

  pub fn current(&self) -> Arc<EngineSettingsData> {
    self.state.load_full()
  }

  pub fn mutate(&self, f: impl Fn(&mut EngineSettingsData)) {
    self.state.rcu(|current| {
      let mut next = (**current).clone();
      f(&mut next);
      next
    });
    self.saver.request_save((*self.current()).clone());
  }
}
