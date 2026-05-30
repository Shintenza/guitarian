use std::env;


const DEFAULT_REP_SOCKET_ADDRESS: &str = "127.0.0.1:6666";
const DEFAULT_PULL_SOCKET_ADDRESS: &str = "127.0.0.1:6667";

pub fn get_sockets_endpoints() -> (String, String) {
  let rep_address = env::var("SOCKET_ADDRESS").unwrap_or(DEFAULT_REP_SOCKET_ADDRESS.to_string());
  let pull_address = env::var("SOCKET_ADDRESS").unwrap_or(DEFAULT_PULL_SOCKET_ADDRESS.to_string());

  let rep_endpoint = format!("tcp://{rep_address}");
  let pull_endpoint = format!("tcp://{pull_address}");

  (rep_endpoint, pull_endpoint)
}
