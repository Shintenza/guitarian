use std::fs;
use std::path::PathBuf;
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

use serde::Serialize;
use serde::de::DeserializeOwned;

pub struct DebouncedSaver<T> {
  tx: mpsc::Sender<T>,
}

impl<T> Clone for DebouncedSaver<T> {
  fn clone(&self) -> Self {
    Self { tx: self.tx.clone() }
  }
}

impl<T> DebouncedSaver<T>
where
  T: Serialize + Send + 'static,
{
  pub fn new(path: PathBuf, debounce: Duration) -> Self {
    let (tx, rx) = mpsc::channel::<T>();

    thread::spawn(move || {
      while let Ok(mut snapshot) = rx.recv() {
        thread::sleep(debounce);
        while let Ok(newer) = rx.try_recv() {
          snapshot = newer;
        }

        if let Err(err) = write_atomic(&path, &snapshot) {
          log::warn!("failed to persist {}: {err}", path.display());
        }
      }
    });

    Self { tx }
  }

  pub fn request_save(&self, value: T) {
    let _ = self.tx.send(value);
  }
}

pub fn write_atomic<T: Serialize>(path: &PathBuf, value: &T) -> anyhow::Result<()> {
  let tmp_path = shared::utils::path::append_suffix(path, "tmp")
    .ok_or_else(|| anyhow::anyhow!("failed to build tmp path for {}", path.display()))?;

  let json = serde_json::to_string_pretty(value)?;
  fs::write(&tmp_path, &json)?;
  fs::rename(&tmp_path, path)?;
  Ok(())
}

pub fn read_json<T: DeserializeOwned>(path: &PathBuf) -> Option<T> {
  let contents = fs::read_to_string(path).ok()?;
  serde_json::from_str(&contents).ok()
}
