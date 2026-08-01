use std::env;

const DEFAULT_BIND_ADDRESS: &str = "0.0.0.0:3000";

pub fn get_bind_address() -> String {
  env::var("BIND_ADDRESS").unwrap_or(DEFAULT_BIND_ADDRESS.to_string())
}
