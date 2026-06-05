use std::{fs, path::PathBuf};

const DB_LOCATION: &str = "db/db.sqlite";

fn get_app_data_dir() -> PathBuf {
  let home_dir = std::env::var("HOME").unwrap_or_else(|_| "/root".to_owned());
  let data_dir = PathBuf::from(home_dir).join(".local/share/guitarian");

  if !data_dir.exists() {
    fs::create_dir_all(&data_dir).expect("failed to create app data directory");
  }

  data_dir
}

pub fn get_db_location() -> PathBuf {
  let app_dir = get_app_data_dir();
  let db_path = app_dir.join(DB_LOCATION);

  if let Some(parent_dir) = db_path.parent() {
    if !parent_dir.exists() {
      fs::create_dir_all(parent_dir).expect("failed to create db directory");
    }
  }
  db_path
}
