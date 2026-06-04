use std::{env, fs, io::ErrorKind, path::Path};

const DEFAULT_REP_SOCKET_ADDRESS: &str = "/tmp/guitarian/rep.sock";
const DEFAULT_PULL_SOCKET_ADDRESS: &str = "/tmp/guitarian/pull.sock";
const DEFAULT_PUB_SOCKET_ADDRESS: &str = "/tmp/guitarian/pub.sock";

fn prepare_endpoint(endpoint: &str, delete_exisiting_socket: bool) {
  if let Some(path_str) = endpoint.strip_prefix("ipc://") {
    let path = Path::new(path_str);

    if let Some(parent) = path.parent() {
      fs::create_dir_all(parent).expect("failed to create socket dir");
    }

    if delete_exisiting_socket {
      match fs::remove_file(path) {
        Ok(_) => {}
        Err(e) if e.kind() == ErrorKind::NotFound => {}
        Err(_e) => panic!("failed to remove stale socket file"),
      }
    }
  }
}

pub fn prepare_connect_endpoint(endpoint: &str) {
  prepare_endpoint(endpoint, false);
}

pub fn prepare_bind_endpoint(endpoint: &str) {
  prepare_endpoint(endpoint, true);
}

pub fn get_sockets_endpoints() -> (String, String, String) {
  let rep_address =
    env::var("REP_SOCKET_ADDRESS").unwrap_or(DEFAULT_REP_SOCKET_ADDRESS.to_string());
  let pull_address =
    env::var("PULL_SOCKET_ADDRESS").unwrap_or(DEFAULT_PULL_SOCKET_ADDRESS.to_string());
  let pub_address =
    env::var("PUB_SOCKET_ADDRESS").unwrap_or(DEFAULT_PUB_SOCKET_ADDRESS.to_string());

  let rep_endpoint = format!("ipc://{rep_address}");
  let pull_endpoint = format!("ipc://{pull_address}");
  let pub_endpoint = format!("ipc://{pub_address}");

  (rep_endpoint, pull_endpoint, pub_endpoint)
}
