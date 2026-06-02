use std::env;

const DEFAULT_REP_SOCKET_ADDRESS: &str = "/tmp/guitarian/rep.sock";
const DEFAULT_PULL_SOCKET_ADDRESS: &str = "/tmp/guitarian/pull.sock";
const DEFAULT_PUB_SOCKET_ADDRESS: &str = "/tmp/guitarian/pub.sock";

pub fn get_sockets_endpoints() -> (String, String, String) {
  let rep_address =
    env::var("REP_SOCKET_ADDRESS").unwrap_or(DEFAULT_REP_SOCKET_ADDRESS.to_string());
  let pull_address =
    env::var("PULL_SOCKET_ADDRESS").unwrap_or(DEFAULT_PULL_SOCKET_ADDRESS.to_string());
  let pub_address =
    env::var("PUB_SOCKET_ADDRESS").unwrap_or(DEFAULT_PUB_SOCKET_ADDRESS.to_string());

  let rep_endpoint = format!("ipc://{rep_address}");
  let pull_endpoint = format!("ipc://{pull_address}");
  let pub_address = format!("ipc:://{pub_address}");

  (rep_endpoint, pull_endpoint, pub_address)
}
