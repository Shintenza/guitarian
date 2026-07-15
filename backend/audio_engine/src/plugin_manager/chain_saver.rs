use anyhow::{Context, Result};
use shared::data::{ControlState, PresetItem};
use shared::utils::app_data::get_chain_dump_location;
use shared::utils::path::append_suffix;
use std::fs;
use std::sync::atomic::Ordering;
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

use crate::plugin_manager::types::InstanceConfig;

const DEBUNCE_TIME: u64 = 300;

pub struct ChainSaver {
  save_tx: mpsc::Sender<Vec<PresetItem>>,
}

impl ChainSaver {
  pub fn new() -> Self {
    let (tx, rx) = mpsc::channel::<Vec<PresetItem>>();

    thread::spawn(move || {
      while let Ok(mut snapshot) = rx.recv() {
        thread::sleep(Duration::from_millis(DEBUNCE_TIME));
        while let Ok(newer_snapshot) = rx.try_recv() {
          snapshot = newer_snapshot;
        }

        let _ = ChainSaver::dump_snapshot(&snapshot);
      }
    });

    Self { save_tx: tx }
  }

  fn dump_snapshot(snapshot: &Vec<PresetItem>) -> Result<()> {
    let save_path = get_chain_dump_location();
    let tmp_path = append_suffix(&save_path, "tmp").context("failed to get tmp path")?;

    let json = serde_json::to_string_pretty(snapshot)?;
    if fs::write(&tmp_path, &json).is_ok() {
      fs::rename(&tmp_path, &save_path)?;
    }

    Ok(())
  }

  pub fn load_preset_from_disk() -> Option<Vec<PresetItem>> {
    let json = fs::read_to_string(get_chain_dump_location()).ok()?;
    serde_json::from_str(&json).ok()
  }

  pub fn request_save(&self, chain: Vec<InstanceConfig>) {
    let preset: Vec<PresetItem> = chain
      .into_iter()
      .map(|config| {
        let controls_state = config
          .state
          .iter()
          .map(|item| ControlState {
            id: item.id as u16,
            value: item.value.load(Ordering::Relaxed),
          })
          .collect();

        PresetItem {
          plugin_uri: config.plugin_uri,
          controls_state,
        }
      })
      .collect();

    let _ = self.save_tx.send(preset);
  }
}
