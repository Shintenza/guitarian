use sea_orm::{ConnectionTrait, Database, DatabaseConnection, DbErr};
use shared::utils::app_data::get_db_location;

pub async fn init_db() -> Result<DatabaseConnection, DbErr> {
  let location = get_db_location();
  let db_path = location.to_str().expect("failed to get db path string");

  let db_url = format!("sqlite://{}?mode=rwc", db_path);
  let db = Database::connect(&db_url).await?;
  let create_table_sql = r#"
    CREATE TABLE IF NOT EXISTS presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      data JSON NOT NULL
    );
  "#;

  db.execute_unprepared(create_table_sql).await?;
  Ok(db)
}
