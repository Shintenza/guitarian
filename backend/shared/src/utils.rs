use std::env;


const DEFAULT_SOCKET_ADDRESS: &str = "127.0.0.1:6666";

pub fn get_rep_socket_address() -> String {
  let address = env::var("SOCKET_ADDRESS").unwrap_or(DEFAULT_SOCKET_ADDRESS.to_string());
  let endpoint = format!("tcp://{address}");

  endpoint
}
