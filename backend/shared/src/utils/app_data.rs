use std::{fs, path::PathBuf};

const DB_LOCATION: &str = "db/db.sqlite";
const CONNECTIONS_STATE: &str = "state/connections.json";
const CHAIN_DUMP: &str = "state/chain.json";
const PERSISTED_SETTING: &str = "state/settings.json";

fn get_app_data_dir() -> PathBuf {
  let home_dir = std::env::var("HOME").unwrap_or_else(|_| "/root".to_owned());
  let data_dir = PathBuf::from(home_dir).join(".local/share/guitarian");

  if !data_dir.exists() {
    fs::create_dir_all(&data_dir).expect("failed to create app data directory");
  }

  data_dir
}

pub fn get_location(location: &str) -> PathBuf {
  let app_dir = get_app_data_dir();
  let path = app_dir.join(location);

  if let Some(parent_dir) = path.parent() {
    if !parent_dir.exists() {
      fs::create_dir_all(parent_dir).expect(&format!("failed to create directory: {location}"));
    }
  }
  path
}

pub fn get_engine_settings_location() -> PathBuf {
  get_location(PERSISTED_SETTING)
}

pub fn get_connections_state_location() -> PathBuf {
  get_location(CONNECTIONS_STATE)
}

pub fn get_db_location() -> PathBuf {
  get_location(DB_LOCATION)
}

pub fn get_chain_dump_location() -> PathBuf {
  get_location(CHAIN_DUMP)
}
