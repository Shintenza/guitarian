#[macro_export]
macro_rules! decode_msg {
  ($msg:expr) => {{
    let raw_msg = $msg.unwrap();
    let payload = raw_msg.get(0).unwrap();
    let (decoded, _size) =
      bincode::decode_from_slice(payload, bincode::config::standard()).unwrap();
    decoded
  }};
}
